import { api } from './axiosConfig';
import {
  DashboardStats,
  ChartData,
  ActivityLog,
  PropertyAnalytics,
  UserAnalytics,
  FinancialAnalytics,
  AnalyticsFilters,
} from '@/types/analytics.types';

export const analyticsApi = {
  // Dashboard
  getDashboardStats: () =>
    api.get<{ stats: DashboardStats; charts: ChartData; recentActivities: ActivityLog[] }>(
      '/admin/dashboard'
    ),

  // Property Analytics
  getPropertyAnalytics: (params?: AnalyticsFilters) =>
    api.get<PropertyAnalytics>('/admin/analytics/properties', { params }),

  // User Analytics
  getUserAnalytics: (params?: AnalyticsFilters) =>
    api.get<UserAnalytics>('/admin/analytics/users', { params }),

  // Financial Analytics
  getFinancialAnalytics: (params?: AnalyticsFilters) =>
    api.get<FinancialAnalytics>('/admin/analytics/financial', { params }),

  // Get recent activities
  getRecentActivities: (params: any) =>
    api.get<ActivityLog[]>('/admin/analytics/activities', { params }),

  // Get chart data
  getChartData: (chartType: string, params: any) =>
    api.get(`/admin/analytics/charts/${chartType}`, { params }),
};
