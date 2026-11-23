import type { Category } from '../types'
import { productClient } from './client'

export const categoriesApi = {
  list: async (): Promise<{ categories: Category[] }> => {
    const res = await productClient.get('/api/v1/categories');
    return res.data;
  },
};
