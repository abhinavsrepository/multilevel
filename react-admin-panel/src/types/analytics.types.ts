export interface DashboardStats {
  totalUsers: number;
  todayRegistrations: number;
  totalInvestment: number;
  todayInvestment: number;
  activeProperties: number;
  totalProperties: number;
  pendingPayouts: {
    count: number;
    amount: number;
  };
  commissionsPaid: number;
  pendingKYC: number;
  activeTickets: number;

  // Growth percentages
  userGrowth: number;
  investmentGrowth: number;
}

export interface ChartData {
  registrationTrend: TimeSeriesData[];
  investmentTrend: TimeSeriesData[];
  commissionDistribution: CategoryData[];
  propertyStatus: CategoryData[];
  topPerformers: RankingData[];
  revenueByType: CategoryData[];
  monthlyComparison: ComparisonData[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface CategoryData {
  category: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface RankingData {
  name: string;
  value: number;
  rank: number;
  userId?: string;
}

export interface ComparisonData {
  period: string;
  revenue: number;
  commission: number;
  profit: number;
}

export interface ActivityLog {
  id: number;
  timestamp: string;
  activityType: string;
  user: {
    userId: string;
    fullName: string;
  };
  amount?: number;
  status: string;
  description: string;
}

export interface AnalyticsFilters {
  period: '7d' | '30d' | '90d' | '1y' | 'all';
  startDate?: string;
  endDate?: string;
}

export interface PropertyAnalytics {
  totalProperties: number;
  activeListings: number;
  soldOutProperties: number;
  totalInvestmentReceived: number;
  averageInvestmentPerProperty: number;
  investmentByProperty: RankingData[];
  propertyTypeDistribution: CategoryData[];
  bookingTrend: TimeSeriesData[];
  geographicDistribution: Record<string, number>;
}

export interface UserAnalytics {
  totalRegistrations: number;
  activeUsers: number;
  inactiveUsers: number;
  churnRate: number;
  retentionRate: number;
  averageLifetimeValue: number;
  registrationTrend: TimeSeriesData[];
  statusDistribution: CategoryData[];
  rankDistribution: CategoryData[];
  cohortAnalysis: CohortData[];
}

export interface CohortData {
  cohort: string;
  users: number;
  retention: number[];
}

export interface FinancialAnalytics {
  totalRevenue: number;
  monthRevenue: number;
  todayRevenue: number;
  totalCommissionsPaid: number;
  monthCommissions: number;
  totalPayouts: number;
  monthPayouts: number;
  profitMargin: number;
  outstandingPayables: number;
  revenueVsCommission: ComparisonData[];
  monthlyProfitLoss: ComparisonData[];
  cashFlow: ComparisonData[];
  commissionDistribution: CategoryData[];
  financialRatios: Record<string, number>;
}
