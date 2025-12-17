import { apiGet } from './config/axiosConfig';
import { ApiResponse } from '@/types';

export interface IncomeDashboard {
  walletBalances: {
    commissionBalance: number;
    levelProfitBalance: number;
    cashbackBalance: number;
    repurchaseBalance: number;
    coinBalance: number;
    dailyIncome: number;
  };
  todayIncome: number;
  thisWeekIncome: number;
  thisMonthIncome: number;
  totalEarnings: number;
  incomeByType: {
    [key: string]: number;
  };
  levelWiseIncome: {
    level: number;
    income: number;
  }[];
}

export interface LevelOverview {
  level: number;
  commissionPercentage: number;
  commissionType: string;
  totalTeamMembers: number;
  activeTeamMembers: number;
  totalIncome: number;
  isEligible: boolean;
  eligibilityReason?: string;
  minTeamRequired: number;
  minActiveRequired: number;
}

export interface Income {
  id: number;
  userId: number;
  incomeType: string;
  amount: number;
  level?: number;
  fromUserId?: number;
  referenceType?: string;
  percentage?: number;
  baseAmount?: number;
  status: string;
  isWithdrawn: boolean;
  withdrawalId?: number;
  createdAt: string;
  FromUser?: {
    firstName: string;
    lastName: string;
    username: string;
  };
}

export interface TeamMember {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  level: number;
  isActive: boolean;
  totalInvestment: number;
  joinedAt: string;
  children?: TeamMember[];
}

/**
 * Get income dashboard stats
 */
export const getIncomeDashboard = async (): Promise<ApiResponse<IncomeDashboard>> => {
  return apiGet<ApiResponse<IncomeDashboard>>('/income/dashboard');
};

/**
 * Get level overview with eligibility
 */
export const getLevelOverview = async (): Promise<ApiResponse<LevelOverview[]>> => {
  return apiGet<ApiResponse<LevelOverview[]>>('/income/level-overview');
};

/**
 * Get income history
 */
export const getIncomeHistory = async (params?: {
  page?: number;
  limit?: number;
  incomeType?: string;
  level?: number;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<{ data: Income[]; total: number }>> => {
  return apiGet<ApiResponse<{ data: Income[]; total: number }>>('/income/history', params);
};

/**
 * Get daily income breakdown
 */
export const getDailyIncome = async (days: number = 30): Promise<ApiResponse<{
  date: string;
  totalIncome: number;
  byType: { [key: string]: number };
}[]>> => {
  return apiGet<ApiResponse<any>>('/income/daily', { days });
};

/**
 * Get team hierarchy
 */
export const getTeamHierarchy = async (params?: {
  maxDepth?: number;
}): Promise<ApiResponse<TeamMember>> => {
  return apiGet<ApiResponse<TeamMember>>('/income/team-hierarchy', params);
};
