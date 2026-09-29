import express from 'express';
import { login, changePassword, register, getUsers } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.put('/change-password', verifyToken, changePassword);
router.post('/change-password', verifyToken, changePassword);
router.post('/register', verifyToken, register);
router.get('/users', verifyToken, getUsers);

export default router;
