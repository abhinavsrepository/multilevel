import api from './axiosConfig';
import type { DashboardStats, ChartData, LeadPipelineData } from '@/types';

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),

  getRevenueChart: (period?: string) => api.get<ChartData[]>('/dashboard/revenue-chart', { params: { period } }),

  getLeadPipeline: () => api.get<LeadPipelineData[]>('/dashboard/lead-pipeline'),

  getRecentActivities: (limit?: number) => api.get('/dashboard/recent-activities', { params: { limit } }),

  getTodayFollowUps: () => api.get('/dashboard/today-follow-ups'),

  getUpcomingTasks: (limit?: number) => api.get('/dashboard/upcoming-tasks', { params: { limit } }),

  getCommissionSummary: () => api.get('/dashboard/commission-summary'),
};
