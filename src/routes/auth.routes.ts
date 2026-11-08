import { Router } from 'express';
import { register, login, forgotPassword, getMe } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticateJWT, getMe);

export default router;
