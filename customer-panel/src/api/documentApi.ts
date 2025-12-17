import api from './axiosConfig';
import type { Document, PaginatedResponse, PaginationParams } from '@/types';

export const documentApi = {
  getAll: (params?: PaginationParams & { type?: string; category?: string }) =>
    api.get<PaginatedResponse<Document>>('/documents', { params }),

  getById: (id: number) => api.get<Document>(`/documents/${id}`),

  upload: (data: FormData) =>
    api.post<Document>('/documents/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: number) => api.delete(`/documents/${id}`),

  download: (id: number) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),

  getByType: (type: string) => api.get<Document[]>(`/documents/type/${type}`),

  getByCategory: (category: string) => api.get<Document[]>(`/documents/category/${category}`),

  getByEntity: (entityType: string, entityId: number) =>
    api.get<Document[]>(`/documents/entity/${entityType}/${entityId}`),
};
