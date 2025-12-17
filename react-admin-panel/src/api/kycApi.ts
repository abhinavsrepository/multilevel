import { api } from './axiosConfig';
import { KYCDocument, KYCFilters, KYCVerificationRequest } from '@/types/kyc.types';
import { PaginatedResponse, FilterParams } from '@/types/api.types';

export const kycApi = {
  // Get all KYC documents
  getKYCDocuments: (params: FilterParams & KYCFilters) =>
    api.get<PaginatedResponse<KYCDocument>>('/admin/kyc', { params }),

  // Get pending KYC
  getPendingKYC: (params: FilterParams) =>
    api.get<PaginatedResponse<KYCDocument>>('/kyc/admin/requests', {
      params: { ...params, status: 'PENDING' }
    }),

  // Get KYC by ID
  getKYCById: (id: number) => api.get<KYCDocument>(`/kyc/admin/requests/${id}`),

  // Approve KYC
  approveKYC: (id: number) =>
    api.put(`/kyc/admin/requests/${id}/review`, { status: 'APPROVED' }),

  // Reject KYC
  rejectKYC: (id: number, reason: string) =>
    api.put(`/kyc/admin/requests/${id}/review`, { status: 'REJECTED', rejectionReason: reason }),

  // Request reupload (Not explicitly in backend yet, using reject for now or need to add backend support)
  requestReupload: (id: number, message: string) =>
    api.put(`/kyc/admin/requests/${id}/review`, { status: 'REJECTED', rejectionReason: `Re-upload requested: ${message}` }),

  // Get user KYC documents
  getUserKYCDocuments: (userId: number) => api.get(`/admin/kyc/user/${userId}`),

  // Export KYC data
  exportKYC: (params: KYCFilters) =>
    api.get('/admin/kyc/export', { params, responseType: 'blob' }),
};
