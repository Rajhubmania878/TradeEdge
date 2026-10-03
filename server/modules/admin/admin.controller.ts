import { Request, Response } from 'express';
import { adminService } from './admin.service';

export class AdminController {
  public getUsers(req: Request, res: Response) {
    try {
      const users = adminService.getAllUsers();
      return res.json({ success: true, users });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to list users.' });
    }
  }

  public updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const user = adminService.updateUserStatus(id, isActive);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      const { passwordHash, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to update user status.' });
    }
  }

  public updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = adminService.updateUserRole(id, role);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      const { passwordHash, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to update user role.' });
    }
  }

  public updateUserPlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { plan } = req.body;
      const user = adminService.updateUserPlan(id, plan);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      const { passwordHash, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to update user plan.' });
    }
  }
}

export const adminController = new AdminController();
export default adminController;
