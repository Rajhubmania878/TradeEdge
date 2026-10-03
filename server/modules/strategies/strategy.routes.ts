import { Router } from 'express';
import { strategyController } from './strategy.controller';
import { requireAuth } from '../../shared/middleware/requireAuth';

export const strategyRouter = Router();

strategyRouter.get('/saved-strategies', requireAuth, strategyController.getUserStrategies);
strategyRouter.post('/saved-strategies', requireAuth, strategyController.saveStrategy);
strategyRouter.delete('/saved-strategies/:id', requireAuth, strategyController.deleteStrategy);

export default strategyRouter;
