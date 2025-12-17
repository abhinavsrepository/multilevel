export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  newLeadsToday: number;
  followUpsToday: number;
  siteVisitsToday: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  commissionEarned: number;
  commissionPending: number;
}

export interface ChartData {
  date: string;
  value: number;
  category?: string;
}

export interface LeadPipelineData {
  status: string;
  count: number;
  percentage: number;
}
