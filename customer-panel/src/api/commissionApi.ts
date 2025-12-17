import api from './axiosConfig';
import type { Commission, CommissionSummary, PaginatedResponse, PaginationParams } from '@/types';

export const commissionApi = {
  getHistory: (params?: PaginationParams & { type?: string; status?: string; dateFrom?: string; dateTo?: string }) =>
    api.get<PaginatedResponse<Commission>>('/commissions/history', { params }),

  getSummary: () => api.get<CommissionSummary>('/commissions/summary'),

  getByType: (type: string) => api.get<Commission[]>(`/commissions/type/${type}`),

  getTrends: (period?: string) => api.get('/commissions/trends', { params: { period } }),

  getThisMonth: () => api.get('/commissions/this-month'),

  getLastMonth: () => api.get('/commissions/last-month'),
};
