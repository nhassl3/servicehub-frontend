import type { Product } from '../types'
import { apiClient } from './client'

export interface ListProductsParams {
  category_id?: number;
  seller_id?: string;
  admin_id?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  offset?: number;
}

export const productsApi = {
  list: async (params: ListProductsParams = {}): Promise<{ products: Product[]; total: number }> => {
    const res = await apiClient.get('/api/v1/products', { params });
    return res.data;
  },

  get: async (id: string): Promise<{ product: Product }> => {
    const res = await apiClient.get(`/api/v1/products/${id}`);
    return res.data;
  },

  search: async (query: string, limit = 20, offset = 0): Promise<{ products: Product[]; total: number }> => {
    const res = await apiClient.get('/api/v1/products/search', { params: { query, limit, offset } });
    return res.data;
  },

  create: async (data: {
    category_id: number;
    title: string;
    description: string;
    price: number;
    tags: string[];
  }): Promise<{ product: Product }> => {
    const res = await apiClient.post('/api/v1/products', data);
    return res.data;
  },

  update: async (
    id: string,
    data: Partial<{ title: string; description: string; price: number; tags: string[]; status: string }>
  ): Promise<{ product: Product }> => {
    const res = await apiClient.patch(`/api/v1/products/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/products/${id}`);
  },
};
