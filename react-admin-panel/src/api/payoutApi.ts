import { api } from './axiosConfig';
import { Payout, PayoutFilters } from '@/types/payout.types';
import { PaginatedResponse, FilterParams } from '@/types/api.types';

export const payoutApi = {
  // Get all payouts
  getPayouts: (params: FilterParams & PayoutFilters) =>
    api.get<PaginatedResponse<Payout>>('/admin/payouts', { params }),

  // Get pending payouts
  getPendingPayouts: (params: FilterParams) =>
    api.get<PaginatedResponse<Payout>>('/admin/payouts/pending', { params }),

  // Get payout by ID
  getPayoutById: (id: number) => api.get<Payout>(`/admin/payouts/${id}`),

  // Approve payout
  approvePayout: (id: number, data?: any) => api.put(`/admin/payouts/${id}/approve`, data),

  // Reject payout
  rejectPayout: (id: number, reason: string) =>
    api.put(`/admin/payouts/${id}/reject`, { reason }),

  // Request more info
  requestMoreInfo: (id: number, message: string) =>
    api.put(`/admin/payouts/${id}/request-info`, { message }),

  // Batch process payouts
  batchProcess: (payoutIds: number[]) =>
    api.post('/admin/payouts/batch-process', { payoutIds }),

  // Retry failed payout
  retryPayout: (id: number) => api.post(`/admin/payouts/${id}/retry`),

  // Download receipt
  downloadReceipt: (id: number) =>
    api.get(`/admin/payouts/${id}/receipt`, { responseType: 'blob' }),

  // Export payouts
  exportPayouts: (params: PayoutFilters) =>
    api.get('/admin/payouts/export', { params, responseType: 'blob' }),

  // Get payout statistics
  getPayoutStats: (params: any) => api.get('/admin/payouts/statistics', { params }),
};
