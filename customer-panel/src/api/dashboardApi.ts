import api from './axiosConfig';
import type { DashboardStats, ChartData, LeadPipelineData, ApiResponse } from '@/types';

export const dashboardApi = {
  getStats: () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),

  getRevenueChart: (period?: string) => api.get<ApiResponse<ChartData[]>>('/dashboard/revenue-chart', { params: { period } }),

  getLeadPipeline: () => api.get<ApiResponse<LeadPipelineData[]>>('/dashboard/lead-pipeline'),

  getRecentActivities: (limit?: number) => api.get('/dashboard/recent-activities', { params: { limit } }),

  getTodayFollowUps: () => api.get<ApiResponse<any[]>>('/dashboard/today-follow-ups'),

  getUpcomingTasks: (limit?: number) => api.get('/dashboard/upcoming-tasks', { params: { limit } }),

  getCommissionSummary: () => api.get('/dashboard/commission-summary'),
};
