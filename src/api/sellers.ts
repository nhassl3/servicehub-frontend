import { apiClient } from './client';
import type { Seller } from '../types';

export const sellersApi = {
  create: async (data: { display_name: string; description: string }): Promise<{ seller: Seller }> => {
    const res = await apiClient.post('/api/v1/sellers', data);
    return res.data;
  },

  getProfile: async (username: string): Promise<{ seller: Seller }> => {
    const res = await apiClient.get(`/api/v1/sellers/${username}`);
    return res.data;
  },

  update: async (data: { display_name?: string; description?: string; avatar_url?: string }): Promise<{ seller: Seller }> => {
    const res = await apiClient.patch('/api/v1/sellers/me', data);
    return res.data;
  },
};
