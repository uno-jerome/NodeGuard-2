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
  assignIncident,
} from '../controllers/incidentController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

const makePublicLimiter = (max, message) =>
  rateLimit({ windowMs: 15 * 60 * 1000, max, standardHeaders: true, legacyHeaders: false, message: { success: false, message } });

router.post('/', makePublicLimiter(30, 'Too many submissions. Please try again later.'), upload.array('files'), createPublicIncident);
router.get('/track/:trackingId', makePublicLimiter(60, 'Too many tracking requests. Please try again later.'), getIncidentByTrackingId);
router.get('/', verifyToken, getIncidents);
router.get('/audit', verifyToken, getAuditLog);
router.patch('/:id/assign', verifyToken, requireRole('ADMIN'), assignIncident);
router.get('/:id', verifyToken, getIncidentById);
router.patch('/:id/status', verifyToken, updateStatus);
router.post('/:id/notes', verifyToken, addNote);
router.get('/:id/dossier', verifyToken, exportDossier);

export default router;
