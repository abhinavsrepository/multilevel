import api from './axiosConfig';
import { ApiResponse } from '../types/common.types';

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  metadata: any;
  createdAt: string;
  User?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export const auditApi = {
  getAuditLogs: (params: AuditLogFilters) =>
    api.get<ApiResponse<AuditLog[]>>('/audit-logs', { params }),
};
