import { api } from './axiosConfig';
import { Commission, CommissionFilters, CommissionSettings } from '@/types/commission.types';
import { PaginatedResponse, FilterParams } from '@/types/api.types';

export const commissionApi = {
  // Get all commissions
  getCommissions: (params: FilterParams & CommissionFilters) =>
    api.get<PaginatedResponse<Commission>>('/admin/commissions', { params }),

  // Get commission by ID
  getCommissionById: (id: number) => api.get<Commission>(`/admin/commissions/${id}`),

  // Approve commission
  approveCommission: (id: number) => api.put(`/admin/commissions/${id}/approve`),

  // Hold commission
  holdCommission: (id: number, reason: string) =>
    api.put(`/admin/commissions/${id}/hold`, { reason }),

  // Release commission
  releaseCommission: (id: number) => api.put(`/admin/commissions/${id}/release`),

  // Cancel commission
  cancelCommission: (id: number, reason: string) =>
    api.put(`/admin/commissions/${id}/cancel`, { reason }),

  // Recalculate commission
  recalculateCommission: (id: number) => api.put(`/admin/commissions/${id}/recalculate`),

  // Get commission settings
  getCommissionSettings: () => api.get<CommissionSettings>('/admin/settings/commission'),

  // Update commission settings
  updateCommissionSettings: (data: Partial<CommissionSettings>) =>
    api.put('/admin/settings/commission', data),

  // Export commissions
  exportCommissions: (params: CommissionFilters) =>
    api.get('/admin/commissions/export', { params, responseType: 'blob' }),

  // Get commission statistics
  getCommissionStats: (params: any) => api.get('/admin/commissions/statistics', { params }),
};
