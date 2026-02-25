import { apiClient } from './client';
import type { Order } from '../types';

export const ordersApi = {
  create: async (): Promise<{ order: Order }> => {
    const res = await apiClient.post('/api/v1/orders');
    return res.data;
  },

  get: async (id: string): Promise<{ order: Order }> => {
    const res = await apiClient.get(`/api/v1/orders/${id}`);
    return res.data;
  },

  list: async (params?: { status?: string; limit?: number; offset?: number }): Promise<{ orders: Order[]; total: number }> => {
    const res = await apiClient.get('/api/v1/orders', { params });
    return res.data;
  },

  cancel: async (id: string): Promise<{ order: Order }> => {
    const res = await apiClient.post(`/api/v1/orders/${id}/cancel`);
    return res.data;
  },
};
