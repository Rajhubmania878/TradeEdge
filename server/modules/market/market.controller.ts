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
      const status = marketService.getStatus();
      if (!status.connected || status.sessionExpired) {
        return res.json({
          success: true,
          data: [],
          connected: false,
          sessionExpired: Boolean(status.sessionExpired),
          simulatedFallback: true
        });
      }

      const quotes = await marketService.getQuotes(req.body);
      const postStatus = marketService.getStatus();
      return res.json({
        success: true,
        data: quotes,
        connected: postStatus.connected,
        sessionExpired: Boolean(postStatus.sessionExpired),
        simulatedFallback: quotes.length === 0
      });
    } catch (err: any) {
      return res.json({
        success: true,
        data: [],
        connected: false,
        sessionExpired: true,
        error: err.message || 'Quote fetch fallback triggered'
      });
    }
  }
}

export const marketController = new MarketController();
export default marketController;
