import { Response } from 'express';
import { AuthRequest } from '../../shared/middleware/requireAuth';
import { strategyService } from './strategy.service';

export class StrategyController {
  public getUserStrategies(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const strategies = strategyService.getUserStrategies(userId);
      return res.json({ success: true, strategies });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch strategies.' });
    }
  }

  public saveStrategy(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const strategy = strategyService.saveStrategy(userId, req.body);
      return res.json({ success: true, strategy });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to save strategy.' });
    }
  }

  public deleteStrategy(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const deleted = strategyService.deleteStrategy(id, userId);

      if (deleted) {
        return res.json({ success: true, message: 'Strategy preset removed.' });
      }
      return res.status(404).json({ success: false, message: 'Strategy configuration not found.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to delete strategy.' });
    }
  }
}

export const strategyController = new StrategyController();
export default strategyController;
