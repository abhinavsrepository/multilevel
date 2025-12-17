import axiosInstance from './config/axiosConfig';

// Type Definitions
export interface BonanzaCriteria {
  salesVolume?: number;
  directReferrals?: number;
  teamVolume?: number;
  groupRatio?: {
    leg1: number;
    leg2: number;
    leg3: number;
  };
  minRank?: string;
  minClub?: string;
  plotBookings?: number;
}

export interface Bonanza {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  daysRemaining?: number;
  qualificationCriteria: BonanzaCriteria;
  rewardType: 'FIXED' | 'PERCENTAGE' | 'POOL_SHARE' | 'ITEM';
  rewardAmount?: number;
  rewardDescription?: string;
  bannerImage?: string;
  iconImage?: string;
  maxQualifiers?: number;
  currentQualifiers: number;
  slotsRemaining?: number | null;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'UPCOMING' | 'CANCELLED';
  myProgress?: BonanzaProgress;
}

export interface BonanzaProgress {
  status: 'PENDING' | 'IN_PROGRESS' | 'QUALIFIED' | 'AWARDED' | 'DISQUALIFIED' | 'EXPIRED';
  overallProgress: number;
  salesProgress: number;
  referralProgress: number;
  teamVolumeProgress: number;
  progressData: {
    salesVolume: number;
    directReferrals: number;
    teamVolume: number;
    groupVolumes: Array<{ userId: number; volume: number }>;
    plotBookings?: number;
    currentRank?: string;
    currentClub?: string;
  };
  rank?: number;
  qualifiedDate?: string;
  awardedDate?: string;
  rewardAmount?: number;
}

export interface BonanzaQualification {
  id: number;
  bonanzaId: number;
  userId: number;
  status: string;
  overallProgress: number;
  progressData: any;
  qualifiedDate?: string;
  awardedDate?: string;
  rewardAmount?: number;
  bonanza: {
    id: number;
    name: string;
    description: string;
    rewardType: string;
    rewardDescription: string;
    startDate: string;
    endDate: string;
    status: string;
  };
}

export interface RequirementStatus {
  required: number;
  current: number;
  remaining: number;
  percentage: number;
  met: boolean;
}

export interface DetailedProgress {
  bonanza: {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
    rewardType: string;
    rewardAmount?: number;
    rewardDescription?: string;
  };
  qualification: {
    status: string;
    overallProgress: number;
    qualifiedDate?: string;
    awardedDate?: string;
    rewardAmount?: number;
    rank?: number;
  };
  requirements: {
    salesVolume?: RequirementStatus;
    directReferrals?: RequirementStatus;
    teamVolume?: RequirementStatus;
    rank?: {
      required: string;
      current?: string;
      met: boolean;
    };
    club?: {
      required: string;
      current?: string;
      met: boolean;
    };
  };
  milestones: Array<{
    name: string;
    achievedDate: string;
    value: number;
  }>;
  isQualified: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  name: string;
  status: string;
  overallProgress: number;
  leaderboardScore: number;
  progressData: any;
  qualifiedDate?: string;
  rewardAmount?: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  myPosition?: {
    rank: number;
    overallProgress: number;
    leaderboardScore: number;
    status: string;
  };
  totalParticipants: number;
}

export interface BonanzaSummary {
  activeBonanzas: number;
  participating: number;
  inProgress: number;
  qualified: number;
  totalEarned: number;
  topProgress?: {
    bonanzaName: string;
    progress: number;
    status: string;
  };
}

// API Functions

/**
 * Get bonanza summary for dashboard widget
 */
export const getBonanzaSummary = async (): Promise<BonanzaSummary> => {
  const response = await axiosInstance.get('/bonanza/summary');
  return response.data.data;
};

/**
 * Get all active bonanzas with user's progress
 */
export const getActiveBonanzas = async (): Promise<Bonanza[]> => {
  const response = await axiosInstance.get('/bonanza/active');
  return response.data.data;
};

/**
 * Get upcoming bonanzas
 */
export const getUpcomingBonanzas = async (): Promise<Bonanza[]> => {
  const response = await axiosInstance.get('/bonanza/upcoming');
  return response.data.data;
};

/**
 * Get my bonanza achievements/history
 */
export const getMyAchievements = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await axiosInstance.get('/bonanza/my-achievements', { params });
  return response.data;
};

/**
 * Get detailed progress for a specific bonanza
 */
export const getMyProgress = async (bonanzaId: number): Promise<DetailedProgress> => {
  const response = await axiosInstance.get(`/bonanza/${bonanzaId}/my-progress`);
  return response.data.data;
};

/**
 * Get leaderboard for a bonanza
 */
export const getBonanzaLeaderboard = async (
  bonanzaId: number,
  limit: number = 20
): Promise<LeaderboardResponse> => {
  const response = await axiosInstance.get(`/bonanza/${bonanzaId}/leaderboard`, {
    params: { limit }
  });
  return response.data.data;
};

/**
 * Trigger qualification check manually (refresh progress)
 */
export const checkQualification = async () => {
  const response = await axiosInstance.post('/bonanza/check-qualification');
  return response.data;
};

export default {
  getBonanzaSummary,
  getActiveBonanzas,
  getUpcomingBonanzas,
  getMyAchievements,
  getMyProgress,
  getBonanzaLeaderboard,
  checkQualification
};
