import express from 'express';
import { login, changePassword, register, getUsers, deactivateUser } from '../controllers/authController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.put('/change-password', verifyToken, changePassword);
router.post('/change-password', verifyToken, changePassword);
router.post('/register', verifyToken, register);
router.get('/users', verifyToken, getUsers);
router.delete('/users/:id', verifyToken, requireRole('ADMIN'), deactivateUser);

export default router;
