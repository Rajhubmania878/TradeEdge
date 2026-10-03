import { Request, Response, NextFunction } from 'express';
import { sessionsStore, usersStore, UserRecord } from '../store';

export interface AuthRequest extends Request {
  user?: UserRecord;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  const userId = sessionsStore.get(token);
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid. Please log in again.' });
  }

  const user = usersStore.get(userId);
  if (!user) {
    return res.status(401).json({ success: false, message: 'User account not found.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact admin.' });
  }

  req.user = user;
  next();
}

export default requireAuth;
