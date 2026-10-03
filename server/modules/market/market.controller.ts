import { Request, Response } from 'express';
import { marketService } from './market.service';

export class MarketController {
  public getStatus(req: Request, res: Response) {
    try {
      const status = marketService.getStatus();
      return res.json(status);
    } catch (err: any) {
      return res.json({
        connected: false,
        mode: 'SIMULATED',
        error: err.message || 'Status check failed'
      });
    }
  }

  public async loginBroker(req: Request, res: Response) {
    try {
      const result = await marketService.loginBroker(req.body);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Broker login failed.' });
    }
  }

  public async getQuotes(req: Request, res: Response) {
    try {
      const quotes = await marketService.getQuotes(req.body);
      return res.json({
        success: true,
        data: quotes,
        simulatedFallback: quotes.length === 0
      });
    } catch (err: any) {
      return res.json({
        success: true,
        data: [],
        error: err.message || 'Quote fetch fallback triggered'
      });
    }
  }
}

export const marketController = new MarketController();
export default marketController;
