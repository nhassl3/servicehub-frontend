import type { WishlistItem } from '../types'
import { apiClient } from './client'

export const wishlistApi = {
  get: async (): Promise<{ items: WishlistItem[] }> => {
    const res = await apiClient.get('/api/v1/wishlist');
    return res.data;
  },

  exists: async (product_id: string): Promise<{ in_wishlist: boolean }> => {
    const res = await apiClient.get(`/api/v1/wishlist/items/${product_id}`);
    return res.data;
  },

  add: async (product_id: string): Promise<{ item: WishlistItem }> => {
    const res = await apiClient.post('/api/v1/wishlist/items', { product_id });
    return res.data;
  },

  remove: async (product_id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/wishlist/items/${product_id}`);
  },
};
