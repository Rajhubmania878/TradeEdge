import { Response, NextFunction } from 'express';
import { AuthRequest } from './requireAuth';

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin authorization required.' });
  }
  next();
}

export default requireAdmin;
