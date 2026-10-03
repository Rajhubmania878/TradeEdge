import { apiClient } from './api/apiClient';
import { UserSavedStrategy } from '@/shared/types';

export const strategyApi = {
  async getSavedStrategies(): Promise<{ strategies: UserSavedStrategy[] }> {
    return apiClient.get<{ strategies: UserSavedStrategy[] }>('/api/user/saved-strategies');
  },

  async saveStrategy(strategy: Omit<UserSavedStrategy, 'id' | 'userId' | 'createdAt'>): Promise<{ strategy: UserSavedStrategy }> {
    return apiClient.post<{ strategy: UserSavedStrategy }>('/api/user/saved-strategies', strategy);
  },

  async deleteSavedStrategy(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/api/user/saved-strategies/${id}`);
  }
};
export default strategyApi;
