import { api } from './axiosConfig';
import { SystemSettings, AdminUser, CreateAdminRequest } from '@/types/settings.types';
import { Rank } from '@/types/user.types';

export const settingsApi = {
  // Get all settings
  getSettings: () => api.get<SystemSettings>('/admin/settings'),

  // Update settings by category
  updateSettings: (category: string, data: any) =>
    api.put(`/admin/settings/${category}`, data),

  // Get admin users
  getAdminUsers: () => api.get<AdminUser[]>('/admin/admin-users'),

  // Create admin user
  createAdminUser: (data: CreateAdminRequest) => api.post('/admin/admin-users', data),

  // Update admin user
  updateAdminUser: (id: number, data: Partial<AdminUser>) =>
    api.put(`/admin/admin-users/${id}`, data),

  // Delete admin user
  deleteAdminUser: (id: number) => api.delete(`/admin/admin-users/${id}`),

  // Activate/Deactivate admin user
  toggleAdminUserStatus: (id: number) => api.put(`/admin/admin-users/${id}/toggle-status`),

  // Reset admin user password
  resetAdminPassword: (id: number) => api.post(`/admin/admin-users/${id}/reset-password`),

  // Get ranks
  getRanks: () => api.get<Rank[]>('/admin/ranks'),

  // Create rank
  createRank: (data: Partial<Rank>) => api.post('/admin/ranks', data),

  // Update rank
  updateRank: (id: number, data: Partial<Rank>) => api.put(`/admin/ranks/${id}`, data),

  // Delete rank
  deleteRank: (id: number) => api.delete(`/admin/ranks/${id}`),

  // Reorder ranks
  reorderRanks: (ranksOrder: number[]) => api.put('/admin/ranks/reorder', { ranksOrder }),

  // Get rank achievements
  getRankAchievements: (params: any) => api.get('/admin/rank-achievements', { params }),

  // Pay rank bonus
  payRankBonus: (achievementId: number) =>
    api.post(`/admin/rank-achievements/${achievementId}/pay-bonus`),

  // Test email settings
  testEmail: (email: string) => api.post('/admin/settings/test-email', { email }),

  // Test SMS settings
  testSMS: (mobile: string) => api.post('/admin/settings/test-sms', { mobile }),

  // Upload logo
  uploadLogo: (file: File) => api.uploadFile('/admin/settings/upload-logo', file, 'logo'),

  // Upload favicon
  uploadFavicon: (file: File) =>
    api.uploadFile('/admin/settings/upload-favicon', file, 'favicon'),
};
