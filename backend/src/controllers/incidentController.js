import Incident from '../models/Incident.js';
import ChainOfCustodyLog from '../models/ChainOfCustodyLog.js';
import { registerPublicIncident } from '../services/incidentService.js';
import { ALLOWED_STATUSES, buildIncidentFilter } from '../utils/incidentHelpers.js';
import { generateDossierPDF } from '../utils/pdfGenerator.js';

export const createPublicIncident = async (req, res) => {
  try {
    const { title, category, narrative } = req.body;
    if (!title || !category || !narrative) {
      return res.status(400).json({ success: false, message: 'Title, category, and narrative are required.' });
    }
    const { trackingId } = await registerPublicIncident(req.body, req.file, req.ip);
    return res.status(201).json({ success: true, trackingId });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Failed to create incident: ${error.message}` });
  }
};

export const getIncidentByTrackingId = async (req, res) => {
  try {
    const incident = await Incident.findOne({ trackingId: req.params.trackingId.toUpperCase() })
      .select('trackingId title category status priority incidentDate notes createdAt');
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found with given tracking ID.' });
    return res.status(200).json({ success: true, incident });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getIncidents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = buildIncidentFilter(req.query);
    const skip = (Number(page) - 1) * Number(limit);
    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .populate('assignedTo', 'name email role')
        .populate('evidenceFiles', 'originalFilename fileSize mimeType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Incident.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, incidents, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('evidenceFiles');
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found.' });

    const custodyLogs = await ChainOfCustodyLog.find({ incidentId: incident._id })
      .populate('performedBy', 'name email role')
      .populate('evidenceFileId', 'originalFilename')
      .sort({ timestamp: 1 });
    return res.status(200).json({ success: true, incident, custodyLogs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}` });
    }
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found.' });

    const previousStatus = incident.status;
    incident.status = status;
    await incident.save();

    await ChainOfCustodyLog.create({
      incidentId: incident._id,
      evidenceFileId: null,
      performedBy: req.user.id,
      action: 'STATUS_CHANGE',
      details: `Status changed from "${previousStatus}" to "${status}" by ${req.user.name || req.user.email}`,
      ipAddress: req.ip || '127.0.0.1',
    });
    return res.status(200).json({ success: true, incident });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Note text cannot be empty.' });

    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found.' });

    const newNote = { author: req.user.name || req.user.email, text: text.trim(), date: new Date() };
    incident.notes.push(newNote);
    await incident.save();

    await ChainOfCustodyLog.create({
      incidentId: incident._id,
      evidenceFileId: null,
      performedBy: req.user.id,
      action: 'NOTE_ADDED',
      details: `Note added by ${req.user.name || req.user.email}`,
      ipAddress: req.ip || '127.0.0.1',
    });
    return res.status(200).json({ success: true, notes: incident.notes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const exportDossier = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('evidenceFiles');
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found.' });

    const logs = await ChainOfCustodyLog.find({ incidentId: incident._id })
      .populate('performedBy', 'name email role')
      .populate('evidenceFileId', 'originalFilename')
      .sort({ timestamp: 1 });

    await ChainOfCustodyLog.create({
      incidentId: incident._id,
      evidenceFileId: null,
      performedBy: req.user.id,
      action: 'DOSSIER_EXPORT',
      details: 'Official forensic court dossier exported as PDF',
      ipAddress: req.ip || '127.0.0.1',
    });
    return generateDossierPDF(incident, logs, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { createPublicIncident, getIncidentByTrackingId, getIncidents, getIncidentById, updateStatus, addNote, exportDossier };
