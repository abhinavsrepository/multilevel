import { apiGet } from './config/axiosConfig';
import { ApiResponse } from '@/types';
import { RankInfo } from './rank-achievement.api';

// ==================== Types ====================

export type RewardType = 'MONTHLY_LEADERSHIP' | 'ONE_TIME_BONUS' | 'COMMISSION_BOOST';
export type RewardStatus = 'PENDING' | 'PROCESSED' | 'PAID' | 'FAILED';

export interface RankReward {
  id: number;
  userId: number;
  rankId: number;
  rewardType: RewardType;
  rewardAmount: number;
  periodMonth?: number;
  periodYear?: number;
  status: RewardStatus;
  processedAt?: string;
  paidAt?: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  Rank?: RankInfo;
}

export interface RewardSummary {
  monthlyRewards: {
    total: number;
    pending: number;
    paid: number;
  };
  oneTimeBonuses: {
    total: number;
    pending: number;
    paid: number;
  };
  overall: {
    total: number;
    pending: number;
    paid: number;
  };
}

export interface MyRewardsResponse {
  rewards: RankReward[];
  summary: RewardSummary;
}

export interface RewardStats {
  reward_type: RewardType;
  status: RewardStatus;
  count: number;
  total_amount: number;
}

export interface MonthlyBreakdown {
  period_month: number;
  total_amount: number;
  count: number;
}

export interface MyRewardStatsResponse {
  stats: RewardStats[];
  monthlyBreakdown: MonthlyBreakdown[];
}

// ==================== User APIs ====================

/**
 * Get current user's rewards
 */
export const getMyRewards = async (params?: {
  status?: RewardStatus;
  rewardType?: RewardType;
}): Promise<ApiResponse<MyRewardsResponse>> => {
  return apiGet<ApiResponse<MyRewardsResponse>>('/rank-rewards/my-rewards', params);
};

/**
 * Get reward statistics for current user
 */
export const getMyRewardStats = async (): Promise<ApiResponse<MyRewardStatsResponse>> => {
  return apiGet<ApiResponse<MyRewardStatsResponse>>('/rank-rewards/my-stats');
};
