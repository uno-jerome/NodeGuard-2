import express from 'express';
import {
  createPublicIncident,
  getIncidentByTrackingId,
  getIncidents,
  getIncidentById,
  updateStatus,
  addNote,
  exportDossier,
} from '../controllers/incidentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', upload.single('file'), createPublicIncident);
router.get('/track/:trackingId', getIncidentByTrackingId);
router.get('/', verifyToken, getIncidents);
router.get('/:id', verifyToken, getIncidentById);
router.patch('/:id/status', verifyToken, updateStatus);
router.post('/:id/notes', verifyToken, addNote);
router.get('/:id/dossier', verifyToken, exportDossier);

export default router;
