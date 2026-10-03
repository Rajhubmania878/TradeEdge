import { Router } from 'express';
import { marketController } from './market.controller';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { requireAdmin } from '../../shared/middleware/requireAdmin';

export const marketRouter = Router();

marketRouter.get('/status', marketController.getStatus);
marketRouter.post('/login', requireAuth, requireAdmin, marketController.loginBroker);
marketRouter.post('/quote', requireAuth, marketController.getQuotes);

export default marketRouter;
