// Dashboard Types
export interface DashboardData {
  user: {
    fullName: string;
    userId: string;
    profilePicture?: string;
    rank: string;
    rankIcon?: string;
  };
  stats: DashboardStats;
  charts: DashboardCharts;
  recentActivities: Activity[];
  announcements: DashboardAnnouncement[];
}

export interface DashboardStats {
  totalInvestment: number;
  totalEarnings: number;
  availableBalance: number;
  teamSize: number;
  activeProperties: number;
  todayIncome: number;
  currentRank: string;
  leftLeg: number;
  rightLeg: number;
  referralCode: string;
  nextRankProgress: number;
}

export interface DashboardCharts {
  earningsTrend: EarningsTrendData[];
  commissionBreakdown: CommissionBreakdownData[];
  portfolioDistribution: PortfolioDistributionData[];
  teamGrowth: TeamGrowthData[];
}

export interface EarningsTrendData {
  date: string;
  totalEarnings: number;
  commission: number;
  roi: number;
}

export interface CommissionBreakdownData {
  type: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface PortfolioDistributionData {
  propertyType: string;
  currentValue: number;
  invested: number;
  count: number;
  color: string;
}

export interface TeamGrowthData {
  month: string;
  leftLeg: number;
  rightLeg: number;
}

export interface Activity {
  id: number;
  type: ActivityType;
  icon: string;
  description: string;
  amount?: number;
  timeAgo: string;
  status?: string;
  statusColor?: string;
}

export type ActivityType =
  | 'NEW_MEMBER'
  | 'COMMISSION'
  | 'INVESTMENT'
  | 'PAYOUT'
  | 'RANK_UPGRADE'
  | 'PROPERTY_LAUNCH'
  | 'INSTALLMENT_PAID';

export interface DashboardAnnouncement {
  id: number;
  title: string;
  description: string;
  date: string;
  link?: string;
}
