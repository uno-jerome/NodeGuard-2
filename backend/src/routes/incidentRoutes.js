import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createPublicIncident,
  getIncidentByTrackingId,
  getIncidents,
  getIncidentById,
  updateStatus,
  addNote,
  exportDossier,
  getAuditLog,
} from '../controllers/incidentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

const publicIncidentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
});

const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many tracking requests. Please try again later.' },
});

router.post('/', publicIncidentLimiter, upload.array('files'), createPublicIncident);
router.get('/track/:trackingId', trackingLimiter, getIncidentByTrackingId);
router.get('/', verifyToken, getIncidents);
router.get('/audit', verifyToken, getAuditLog);
router.get('/:id', verifyToken, getIncidentById);
router.patch('/:id/status', verifyToken, updateStatus);
router.post('/:id/notes', verifyToken, addNote);
router.get('/:id/dossier', verifyToken, exportDossier);

export default router;
