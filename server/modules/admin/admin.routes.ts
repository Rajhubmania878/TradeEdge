import { Router } from 'express';
import { adminController } from './admin.controller';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { requireAdmin } from '../../shared/middleware/requireAdmin';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/users', adminController.getUsers);
adminRouter.patch('/users/:id/status', adminController.updateUserStatus);
adminRouter.patch('/users/:id/role', adminController.updateUserRole);
adminRouter.patch('/users/:id/plan', adminController.updateUserPlan);

export default adminRouter;
