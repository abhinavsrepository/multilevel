import api from './axiosConfig';
import type { Task, CreateTaskInput, PaginatedResponse, PaginationParams } from '@/types';

export const taskApi = {
  getAll: (params?: PaginationParams & { status?: string; priority?: string; dateFrom?: string; dateTo?: string }) =>
    api.get<PaginatedResponse<Task>>('/tasks', { params }),

  getById: (id: number) => api.get<Task>(`/tasks/${id}`),

  create: (data: CreateTaskInput) => api.post<Task>('/tasks', data),

  update: (id: number, data: Partial<Task>) => api.put<Task>(`/tasks/${id}`, data),

  delete: (id: number) => api.delete(`/tasks/${id}`),

  updateStatus: (id: number, status: string) => api.patch(`/tasks/${id}/status`, { status }),

  getToday: () => api.get<Task[]>('/tasks/today'),

  getOverdue: () => api.get<Task[]>('/tasks/overdue'),

  getUpcoming: () => api.get<Task[]>('/tasks/upcoming'),

  getByStatus: (status: string) => api.get<Task[]>(`/tasks/status/${status}`),
};
