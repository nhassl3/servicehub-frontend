import { apiClient } from './client';
import type { WishlistItem } from '../types';

export const wishlistApi = {
  get: async (): Promise<{ items: WishlistItem[] }> => {
    const res = await apiClient.get('/api/v1/wishlist');
    return res.data;
  },

  add: async (product_id: string): Promise<{ item: WishlistItem }> => {
    const res = await apiClient.post('/api/v1/wishlist', { product_id });
    return res.data;
  },

  remove: async (product_id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/wishlist/${product_id}`);
  },
};
