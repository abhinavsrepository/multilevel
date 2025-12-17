import { api } from './axiosConfig';

export interface Backup {
  id: number;
  fileName: string;
  fileSize: number;
  createdAt: string;
  status: 'SUCCESS' | 'FAILED';
}

export const backupApi = {
  // Create backup
  createBackup: () => api.post<Backup>('/admin/backup/create'),

  // Get backup history
  getBackupHistory: () => api.get<Backup[]>('/admin/backup/history'),

  // Download backup
  downloadBackup: (id: number) =>
    api.get(`/admin/backup/download/${id}`, { responseType: 'blob' }),

  // Restore backup
  restoreBackup: (file: File) => api.uploadFile('/admin/backup/restore', file, 'backup'),

  // Delete backup
  deleteBackup: (id: number) => api.delete(`/admin/backup/${id}`),

  // Export users
  exportUsers: () => api.get('/admin/export/users', { responseType: 'blob' }),

  // Export properties
  exportProperties: () => api.get('/admin/export/properties', { responseType: 'blob' }),

  // Export investments
  exportInvestments: () => api.get('/admin/export/investments', { responseType: 'blob' }),

  // Export transactions
  exportTransactions: () => api.get('/admin/export/transactions', { responseType: 'blob' }),
};
