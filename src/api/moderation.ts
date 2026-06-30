import type { Product } from '../types'
import { type ModerationEntry, type QueueProduct } from '../types'
import { apiClient } from './client'

export const moderationApi = {
  /** Products awaiting review (status = 'draft', not yet claimed or claimed by anyone). */
  queue: async (limit = 20, offset = 0): Promise<{ products: QueueProduct[]; total: number }> => {
    const res = await apiClient.get('/api/v1/moderation/queue', { params: { limit, offset } });
    return res.data;
  },

  /** Products currently claimed by the authenticated admin. */
  my: async (limit = 20, offset = 0): Promise<{ products: QueueProduct[]; total: number }> => {
    const res = await apiClient.get('/api/v1/moderation/my', { params: { limit, offset } });
    return res.data;
  },

  /** Claim (lock) a product for review. Returns the moderation entry. */
  claim: async (productId: string): Promise<{ moderation: ModerationEntry }> => {
    const res = await apiClient.post('/api/v1/moderation/claim', { product_id: productId });
    return res.data;
  },

  /** Release a previously claimed product back to the queue. */
  release: async (productId: string): Promise<void> => {
    await apiClient.post('/api/v1/moderation/release', { product_id: productId });
  },

  /** Approve a product — sets status to 'active'. */
  approve: async (productId: string): Promise<{ product: Product }> => {
    const res = await apiClient.post('/api/v1/moderation/approve', { product_id: productId });
    return res.data;
  },

  /** Reject a product — sets status to 'inactive'. */
  reject: async (productId: string, reason: string): Promise<{ product: Product }> => {
    const res = await apiClient.post('/api/v1/moderation/reject', { product_id: productId, reason });
    return res.data;
  },

  /** Get moderation statistics for the current admin. */
  stats: async (): Promise<{
    total_pending: number;
    total_claimed: number;
    total_approved: number;
    total_rejected: number;
  }> => {
    const res = await apiClient.get('/api/v1/moderation/stats');
    return res.data;
  },
};
