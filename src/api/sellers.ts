import type { Seller } from '../types'
import { apiClient } from './client'

export const sellersApi = {
  create: async (data: { display_name: string; description: string }): Promise<{ seller: Seller }> => {
    const res = await apiClient.post('/api/v1/sellers', data);
    return res.data;
  },

  getProfileByUsername: async (username: string): Promise<{ seller: Seller }> => {
    const res = await apiClient.get(`/api/v1/sellers?username=${username}`);
    return res.data;
  },

  getProfileByUUID: async (uuid: string): Promise<{ seller: Seller }> => {
    const res = await apiClient.get(`/api/v1/sellers?seller_id=${uuid}`);
    return res.data;
  },

  update: async (data: { display_name?: string; description?: string; avatar_url?: string }): Promise<{ seller: Seller }> => {
    const res = await apiClient.patch('/api/v1/sellers/me', data);
    return res.data;
  },
};
