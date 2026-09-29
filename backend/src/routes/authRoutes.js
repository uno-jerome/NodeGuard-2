import express from 'express';
import { login, changePassword, register, getUsers, deactivateUser } from '../controllers/authController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

router.post('/login', loginLimiter, login);
router.put('/change-password', verifyToken, changePassword);
router.post('/change-password', verifyToken, changePassword);
router.post('/register', verifyToken, register);
router.get('/users', verifyToken, getUsers);
router.delete('/users/:id', verifyToken, requireRole('ADMIN'), deactivateUser);

export default router;
