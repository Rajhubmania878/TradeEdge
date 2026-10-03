import { apiClient } from './api/apiClient';
import { UserProfile } from '@/shared/types';

export const authApi = {
  async me(): Promise<{ user: UserProfile } | null> {
    return apiClient.get<{ user: UserProfile }>('/api/auth/me');
  },

  async login(email: string, password: string): Promise<{ success: boolean; user: UserProfile; token: string }> {
    return apiClient.post<{ success: boolean; user: UserProfile; token: string }>('/api/auth/login', {
      email,
      password
    });
  },

  async signup(email: string, password: string, displayName: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/api/auth/signup', {
      email,
      password,
      displayName
    });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/api/auth/forgot-password', { email });
  },

  async logout(): Promise<void> {
    return apiClient.post<void>('/api/auth/logout');
  },

  async adminGetUsers(): Promise<{ users: UserProfile[] }> {
    return apiClient.get<{ users: UserProfile[] }>('/api/admin/users');
  }
};
