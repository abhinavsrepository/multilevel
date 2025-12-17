import api from './axiosConfig';
import type { Notification } from '@/types';

export const notificationApi = {
  getAll: () => api.get<Notification[]>('/notifications'),

  getUnread: () => api.get<Notification[]>('/notifications/unread'),

  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),

  markAllAsRead: () => api.put('/notifications/read-all'),

  delete: (id: number) => api.delete(`/notifications/${id}`),

  getCount: () => api.get<{ count: number }>('/notifications/count'),
};
