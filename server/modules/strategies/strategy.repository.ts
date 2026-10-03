import { savedStrategiesStore, SavedStrategyRecord } from '../../shared/store';

export class StrategyRepository {
  public findByUserId(userId: string): SavedStrategyRecord[] {
    return savedStrategiesStore.filter(s => s.userId === userId);
  }

  public create(strategy: SavedStrategyRecord): SavedStrategyRecord {
    savedStrategiesStore.push(strategy);
    return strategy;
  }

  public delete(id: string, userId: string): boolean {
    const index = savedStrategiesStore.findIndex(s => s.id === id && s.userId === userId);
    if (index !== -1) {
      savedStrategiesStore.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const strategyRepository = new StrategyRepository();
export default strategyRepository;
