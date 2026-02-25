import { apiClient } from './client';
import type { Review } from '../types';

export const reviewsApi = {
  list: async (product_id: string, params?: { limit?: number; offset?: number }): Promise<{ reviews: Review[]; total: number }> => {
    const res = await apiClient.get(`/api/v1/products/${product_id}/reviews`, { params });
    return res.data;
  },

  create: async (product_id: string, data: { rating: number; comment: string }): Promise<{ review: Review }> => {
    const res = await apiClient.post(`/api/v1/products/${product_id}/reviews`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/reviews/${id}`);
  },
};
