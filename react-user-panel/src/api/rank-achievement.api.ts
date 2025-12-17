import { apiGet } from './config/axiosConfig';
import { ApiResponse } from '@/types';

// ==================== Types ====================

export interface RankInfo {
  id: number;
  name: string;
  displayOrder: number;
  icon?: string;
  color?: string;
  benefits?: string;
  oneTimeBonus?: number;
  monthlyBonus?: number;
}

export interface RankAchievement {
  id: number;
  userId: number;
  rankId: number;
  rankName: string;
  achievedAt: string;
  directReferralsCount?: number;
  teamInvestmentAmount?: number;
  personalInvestmentAmount?: number;
  oneTimeBonusGiven: number;
  bonusPaid: boolean;
  bonusPaidAt?: string;
  manualAssignment: boolean;
  assignedBy?: number;
  notes?: string;
  Rank?: RankInfo;
  milestone?: number;
  daysToAchieve?: number;
}

export interface AchievementsSummary {
  totalRanksAchieved: number;
  totalBonusesEarned: number;
  totalBonusesPaid: number;
  pendingBonuses: number;
}

export interface MyAchievementsResponse {
  achievements: RankAchievement[];
  currentRank: RankInfo | null;
  summary: AchievementsSummary;
}

// ==================== User APIs ====================

/**
 * Get current user's rank achievements
 */
export const getMyAchievements = async (): Promise<ApiResponse<MyAchievementsResponse>> => {
  return apiGet<ApiResponse<MyAchievementsResponse>>('/rank-achievements/my-achievements');
};

/**
 * Get achievement timeline for current user
 */
export const getMyAchievementTimeline = async (): Promise<ApiResponse<RankAchievement[]>> => {
  return apiGet<ApiResponse<RankAchievement[]>>('/rank-achievements/my-timeline');
};
