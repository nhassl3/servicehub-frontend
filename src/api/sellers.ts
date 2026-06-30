import type { Seller } from '../types'
import { apiClient } from './client'
import { fileToBase64 } from './fileUtils'

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

  uploadAvatar: async (file: File): Promise<{ seller: Seller }> => {
    const base64 = await fileToBase64(file);
    const res = await apiClient.patch('/api/v1/sellers/uploadavatar', {
      file_data: base64,
      content_type: file.type,
    });
    return res.data;
  },
};
