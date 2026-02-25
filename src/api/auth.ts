import type { AuthTokens, User } from '../types'
import { apiClient } from './client'

export const authApi = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
  }): Promise<AuthTokens> => {
    const res = await apiClient.post('/api/v1/auth/register', data);
    return res.data;
  },

  login: async (data: { username: string; password: string }): Promise<AuthTokens> => {
    const res = await apiClient.post('/api/v1/auth/login', data);
    return res.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout', { refresh_token: refreshToken });
  },

  refresh: async (refreshToken: string): Promise<{ access_token: string; refresh_token: string }> => {
    const res = await apiClient.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
    return res.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await apiClient.get('/api/v1/auth/me');
    return res.data;
  },
};
