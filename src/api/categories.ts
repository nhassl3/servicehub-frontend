import type { Category } from '../types'
import { apiClient } from './client'

export const categoriesApi = {
  list: async (): Promise<{ categories: Category[] }> => {
    const res = await apiClient.get('/api/v1/categories');
    return res.data;
  },
};
