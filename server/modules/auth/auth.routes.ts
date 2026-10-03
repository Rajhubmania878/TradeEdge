import { Router } from 'express';
import { authController } from './auth.controller';
import { requireAuth } from '../../shared/middleware/requireAuth';

export const authRouter = Router();

authRouter.post('/login', authController.login);
authRouter.post('/signup', authController.signup);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.me);

export default authRouter;
