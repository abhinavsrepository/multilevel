import { api } from './axiosConfig';
import {
  User,
  UserFilters,
  CreateUserRequest,
  UpdateUserRequest,
  BinaryTreeNode,
} from '@/types/user.types';
import { PaginatedResponse, FilterParams } from '@/types/api.types';

export const userApi = {
  // Get all users with pagination and filters
  getUsers: (params: FilterParams & UserFilters) =>
    api.get<PaginatedResponse<User>>('/admin/users', { params }),

  // Get user by ID
  getUserById: (id: number) => api.get<User>(`/admin/users/${id}`),

  // Create user
  createUser: (data: CreateUserRequest) => api.post<User>('/admin/users', data),

  // Update user
  updateUser: (id: number, data: UpdateUserRequest) =>
    api.put<User>(`/admin/users/${id}`, data),

  // Delete user
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),

  // Activate user
  activateUser: (id: number) => api.put(`/admin/users/${id}/activate`),

  // Block user
  blockUser: (id: number, reason?: string) =>
    api.put(`/admin/users/${id}/block`, { reason }),

  // Unblock user
  unblockUser: (id: number) => api.put(`/admin/users/${id}/unblock`),

  // Reset password
  resetUserPassword: (id: number, newPassword: string) =>
    api.put(`/admin/users/${id}/reset-password`, { newPassword }),

  // Get binary tree
  getBinaryTree: (userId: string, depth: number = 5) =>
    api.get<BinaryTreeNode>(`/tree/binary/${userId}`, { params: { depth } }),

  // Get unilevel tree
  getUnilevelTree: (userId: string, depth: number = 5) =>
    api.get(`/tree/unilevel/${userId}`, { params: { depth } }),

  // Bulk actions
  bulkActivate: (userIds: number[]) => api.put('/admin/users/bulk-activate', { userIds }),

  bulkBlock: (userIds: number[]) => api.put('/admin/users/bulk-block', { userIds }),

  bulkDelete: (userIds: number[]) => api.delete('/admin/users/bulk-delete', {
    data: { userIds },
  }),

  // Export users
  exportUsers: (params: UserFilters) =>
    api.get('/admin/users/export', { params, responseType: 'blob' }),

  // Send notification to user
  sendNotification: (userId: number, data: any) =>
    api.post(`/admin/users/${userId}/send-notification`, data),

  // Get user activity logs
  getUserActivityLogs: (userId: number, params: any) =>
    api.get(`/admin/users/${userId}/activity-logs`, { params }),

  // Get user investments
  getUserInvestments: (userId: number, params: any) =>
    api.get(`/admin/users/${userId}/investments`, { params }),

  // Get user commissions
  getUserCommissions: (userId: number, params: any) =>
    api.get(`/admin/users/${userId}/commissions`, { params }),

  // Get user payouts
  getUserPayouts: (userId: number, params: any) =>
    api.get(`/admin/users/${userId}/payouts`, { params }),

  // Get user tickets
  getUserTickets: (userId: number, params: any) =>
    api.get(`/admin/users/${userId}/tickets`, { params }),

  addManualCommission: (data: any) => api.post('/admin/commissions/manual', data),
};
