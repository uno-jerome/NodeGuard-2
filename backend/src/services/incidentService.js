import Incident from '../models/Incident.js';
import EvidenceFile from '../models/EvidenceFile.js';
import ChainOfCustodyLog from '../models/ChainOfCustodyLog.js';
import { computeFileHashes } from './forensicService.js';
import { generateTrackingId } from '../utils/trackingIdGenerator.js';

export const registerPublicIncident = async (data, file, ipAddress) => {
  const trackingId = await generateTrackingId();
  const incident = new Incident({
    trackingId,
    title: data.title,
    category: data.category,
    platform: data.platform || 'Web',
    suspectIdentifiers: data.suspectIdentifiers || '',
    estimatedLoss: data.estimatedLoss ? Number(data.estimatedLoss) : 0,
    narrative: data.narrative,
    incidentDate: data.incidentDate || Date.now(),
    complainantName: data.complainantName || 'Anonymous',
    complainantEmail: data.complainantEmail || '',
  });

  let evidenceFile = null;
  let hashes = null;

  if (file) {
    hashes = await computeFileHashes(file.path);
    evidenceFile = await EvidenceFile.create({
      incidentId: incident._id,
      originalFilename: file.originalname,
      storedFilename: file.filename,
      fileSize: file.size,
      mimeType: file.mimetype,
      sha256Hash: hashes.sha256,
      md5Hash: hashes.md5,
    });
    incident.evidenceFiles.push(evidenceFile._id);
  }

  await incident.save();

  await ChainOfCustodyLog.create({
    incidentId: incident._id,
    evidenceFileId: evidenceFile ? evidenceFile._id : null,
    performedBy: null,
    action: 'INGESTION',
    details: evidenceFile
      ? `Public incident created with initial evidence: ${file.originalname}`
      : 'Public incident created without initial evidence file',
    calculatedHash: hashes ? hashes.sha256 : null,
    ipAddress: ipAddress || '127.0.0.1',
  });

  return { trackingId, incident, evidenceFile };
};

export default {
  registerPublicIncident,
};
