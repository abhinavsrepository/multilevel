import api from './axiosConfig';
import type { Client, CreateClientInput, ClientNote, FollowUp, PaginatedResponse, PaginationParams } from '@/types';

export const clientApi = {
  // Client CRUD
  getAll: (params?: PaginationParams & { leadStatus?: string; search?: string }) =>
    api.get<PaginatedResponse<Client>>('/clients', { params }),

  getById: (id: number) => api.get<Client>(`/clients/${id}`),

  create: (data: CreateClientInput) => api.post<Client>('/clients', data),

  update: (id: number, data: Partial<Client>) => api.put<Client>(`/clients/${id}`, data),

  delete: (id: number) => api.delete(`/clients/${id}`),

  // Lead Pipeline
  getByLeadStatus: (status: string) => api.get<Client[]>(`/clients/lead-status/${status}`),

  updateLeadStatus: (id: number, status: string) =>
    api.patch(`/clients/${id}/lead-status`, { status }),

  // Notes & Follow-ups
  getNotes: (clientId: number) => api.get<ClientNote[]>(`/clients/${clientId}/notes`),

  addNote: (clientId: number, note: string) =>
    api.post<ClientNote>(`/clients/${clientId}/notes`, { note }),

  getFollowUps: (clientId: number) => api.get<FollowUp[]>(`/clients/${clientId}/follow-ups`),

  addFollowUp: (clientId: number, data: { scheduledDate: string; notes?: string }) =>
    api.post<FollowUp>(`/clients/${clientId}/follow-ups`, data),

  updateFollowUp: (id: number, data: Partial<FollowUp>) =>
    api.put<FollowUp>(`/clients/follow-ups/${id}`, data),

  // Analytics
  getStats: () => api.get('/clients/stats'),
};
