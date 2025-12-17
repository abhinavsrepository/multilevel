import { api } from './axiosConfig';

export const reportApi = {
  // User Registration Report
  getUserRegistrationReport: (params: any) =>
    api.get('/admin/reports/user-registration', { params, responseType: 'blob' }),

  // Investment Report
  getInvestmentReport: (params: any) =>
    api.get('/admin/reports/investment', { params, responseType: 'blob' }),

  // Commission Report
  getCommissionReport: (params: any) =>
    api.get('/admin/reports/commission', { params, responseType: 'blob' }),

  // Payout Report
  getPayoutReport: (params: any) =>
    api.get('/admin/reports/payout', { params, responseType: 'blob' }),

  // TDS Report
  getTDSReport: (params: any) =>
    api.get('/admin/reports/tds', { params, responseType: 'blob' }),

  // Property Sales Report
  getPropertySalesReport: (params: any) =>
    api.get('/admin/reports/property-sales', { params, responseType: 'blob' }),

  // Team Performance Report
  getTeamPerformanceReport: (params: any) =>
    api.get('/admin/reports/team-performance', { params, responseType: 'blob' }),

  // Rank Achievement Report
  getRankAchievementReport: (params: any) =>
    api.get('/admin/reports/rank-achievement', { params, responseType: 'blob' }),

  // ROI Report
  getROIReport: (params: any) =>
    api.get('/admin/reports/roi', { params, responseType: 'blob' }),

  // Financial Report
  getFinancialReport: (params: any) =>
    api.get('/admin/reports/financial', { params, responseType: 'blob' }),

  // Schedule report
  scheduleReport: (data: any) => api.post('/admin/reports/schedule', data),

  // Get scheduled reports
  getScheduledReports: () => api.get('/admin/reports/scheduled'),

  // Cancel scheduled report
  cancelScheduledReport: (id: number) => api.delete(`/admin/reports/scheduled/${id}`),
};
