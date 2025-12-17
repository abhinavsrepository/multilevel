import api from './axiosConfig';
import type { SiteVisit, CreateSiteVisitInput, UpdateSiteVisitInput, PaginatedResponse, PaginationParams } from '@/types';

export const siteVisitApi = {
  getAll: (params?: PaginationParams & { status?: string; dateFrom?: string; dateTo?: string }) =>
    api.get<PaginatedResponse<SiteVisit>>('/site-visits', { params }),

  getById: (id: number) => api.get<SiteVisit>(`/site-visits/${id}`),

  create: (data: CreateSiteVisitInput) => api.post<SiteVisit>('/site-visits', data),

  update: (id: number, data: UpdateSiteVisitInput) => api.put<SiteVisit>(`/site-visits/${id}`, data),

  delete: (id: number) => api.delete(`/site-visits/${id}`),

  updateStatus: (id: number, status: string) => api.patch(`/site-visits/${id}/status`, { status }),

  getToday: () => api.get<SiteVisit[]>('/site-visits/today'),

  getUpcoming: () => api.get<SiteVisit[]>('/site-visits/upcoming'),

  getByStatus: (status: string) => api.get<SiteVisit[]>(`/site-visits/status/${status}`),

  getByProperty: (propertyId: number) => api.get<SiteVisit[]>(`/site-visits/property/${propertyId}`),

  getByClient: (clientId: number) => api.get<SiteVisit[]>(`/site-visits/client/${clientId}`),
};
