import { apiClient } from './client';
import type { Cart } from '../types';

export const cartApi = {
  get: async (): Promise<{ cart: Cart }> => {
    const res = await apiClient.get('/api/v1/cart');
    return res.data;
  },

  addItem: async (product_id: string, quantity = 1): Promise<{ cart: Cart }> => {
    const res = await apiClient.post('/api/v1/cart/items', { product_id, quantity });
    return res.data;
  },

  removeItem: async (product_id: string): Promise<{ cart: Cart }> => {
    const res = await apiClient.delete(`/api/v1/cart/items/${product_id}`);
    return res.data;
  },

  updateQty: async (product_id: string, quantity: number): Promise<{ cart: Cart }> => {
    const res = await apiClient.patch(`/api/v1/cart/items/${product_id}`, { quantity });
    return res.data;
  },

  clear: async (): Promise<void> => {
    await apiClient.delete('/api/v1/cart');
  },
};
