import express from 'express';
import { verifyEvidence, streamEvidence } from '../controllers/evidenceController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:id/verify', verifyToken, verifyEvidence);
router.get('/:id/download', verifyToken, streamEvidence);

export default router;
