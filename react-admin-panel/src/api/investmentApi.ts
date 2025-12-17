import { api } from './axiosConfig';
import { Investment, InvestmentFilters, Installment } from '@/types/investment.types';
import { PaginatedResponse, FilterParams } from '@/types/api.types';

export const investmentApi = {
  // Get all investments
  getInvestments: (params: FilterParams & InvestmentFilters) =>
    api.get<PaginatedResponse<Investment>>('/admin/investments', { params }),

  // Get investment by ID
  getInvestmentById: (id: number) => api.get<Investment>(`/admin/investments/${id}`),

  // Approve investment
  approveInvestment: (id: number) => api.put(`/admin/investments/${id}/approve`),

  // Reject investment
  rejectInvestment: (id: number, reason: string) =>
    api.put(`/admin/investments/${id}/reject`, { reason }),

  // Cancel investment
  cancelInvestment: (id: number, reason: string) =>
    api.put(`/admin/investments/${id}/cancel`, { reason }),

  // Generate certificate
  generateCertificate: (id: number) =>
    api.post(`/admin/investments/${id}/generate-certificate`, {}, { responseType: 'blob' }),

  // Get installments
  getInstallments: (investmentId: number) =>
    api.get<Installment[]>(`/admin/investments/${investmentId}/installments`),

  // Mark installment as paid
  markInstallmentPaid: (investmentId: number, installmentId: number, data: any) =>
    api.put(`/admin/investments/${investmentId}/installments/${installmentId}/paid`, data),

  // Get pending approvals
  getPendingApprovals: (params: FilterParams) =>
    api.get<PaginatedResponse<Investment>>('/admin/investments/pending', { params }),

  // Bulk approve
  bulkApprove: (investmentIds: number[]) =>
    api.put('/admin/investments/bulk-approve', { investmentIds }),

  // Export investments
  exportInvestments: (params: InvestmentFilters) =>
    api.get('/admin/investments/export', { params, responseType: 'blob' }),
};
