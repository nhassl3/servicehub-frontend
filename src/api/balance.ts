import { apiClient } from './client';
import type { BalanceTransaction } from '../types';

export const balanceApi = {
  get: async (): Promise<{ amount: number }> => {
    const res = await apiClient.get('/api/v1/balance');
    return res.data;
  },

  deposit: async (amount: number): Promise<{ amount: number }> => {
    const res = await apiClient.post('/api/v1/balance/deposit', { amount });
    return res.data;
  },

  getTransactions: async (params?: { limit?: number; offset?: number }): Promise<{ transactions: BalanceTransaction[]; total: number }> => {
    const res = await apiClient.get('/api/v1/balance/transactions', { params });
    return res.data;
  },
};
