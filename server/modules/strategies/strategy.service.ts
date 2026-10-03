import { SavedStrategyRecord } from '../../shared/store';
import { strategyRepository } from './strategy.repository';

export class StrategyService {
  public getUserStrategies(userId: string): SavedStrategyRecord[] {
    return strategyRepository.findByUserId(userId);
  }

  public saveStrategy(userId: string, data: Partial<SavedStrategyRecord>): SavedStrategyRecord {
    const newStrategy: SavedStrategyRecord = {
      id: `strat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name: data.name || `${data.underlying || 'RELIANCE'} ${data.ratioLong || 1}:${data.ratioShort || 3} (Gap ₹${data.gap || 50})`,
      exchange: data.exchange || 'NSE',
      underlying: data.underlying || 'RELIANCE',
      expiry: data.expiry || '29-Oct-2026',
      ratioLong: Number(data.ratioLong) || 1,
      ratioShort: Number(data.ratioShort) || 3,
      gap: Number(data.gap) || 50,
      cnt: Number(data.cnt) || 5,
      stk: data.stk || 'AUTO',
      referenceMode: data.referenceMode || 'ATM',
      optionType: data.optionType || 'CE',
      minStrike: data.minStrike ?? 'ALL',
      maxStrike: data.maxStrike ?? 'ALL',
      createdAt: Date.now()
    };

    return strategyRepository.create(newStrategy);
  }

  public deleteStrategy(id: string, userId: string): boolean {
    return strategyRepository.delete(id, userId);
  }
}

export const strategyService = new StrategyService();
export default strategyService;
