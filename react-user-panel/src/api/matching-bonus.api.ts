import axiosInstance from './config/axiosConfig';

export interface MatchingBonusRecord {
  id: number;
  date: string;
  matchingBonus: number;
  status: string;
  isWithdrawn: boolean;
  payable: number;
  contributorsCount: number;
  remarks?: string;
  processedAt?: string;
}

export interface MatchingBonusContributor {
  id: number;
  downlineUserId: number;
  downlineUsername: string;
  downlineName: string;
  downlineRank: string;
  level: number;
  baseCommissionType: string;
  baseCommissionAmount: number;
  matchedPercentage: number;
  contributionAmount: number;
  cycleStartDate?: string;
  cycleEndDate?: string;
}

export interface MatchingBonusSourceDetail {
  incomeId: number;
  totalAmount: number;
  status: string;
  date: string;
  contributors: MatchingBonusContributor[];
  levelSummary: Array<{
    level: number;
    count: number;
    totalContribution: number;
    averagePercentage: number;
  }>;
  totalContributors: number;
}

export interface MatchingEligibility {
  eligible: boolean;
  currentRank: string;
  matchingDepth: number;
  matchingPercentages: Record<number, number>;
  reason?: string;
  directReferralsCount: number;
  nextRank?: {
    name: string;
    matchingDepth: number;
    requirements: {
      minPersonallySponsored: number;
      requiresDirectSale: boolean;
      requiresActiveLegs: boolean;
    };
    progress: {
      directReferrals: {
        current: number;
        required: number;
      };
    };
  };
}

export interface MatchingBonusHistoryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  cyclePreset?: 'this_cycle' | 'last_7_days' | 'last_30_days' | 'last_cycle' | 'quarter_to_date' | 'year_to_date';
}

export interface MatchingBonusHistoryResponse {
  success: boolean;
  data: MatchingBonusRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  summary: {
    totalMatchingBonus: number;
    totalPayable: number;
    totalPending: number;
    totalWithdrawn: number;
  };
}

/**
 * Get matching bonus history
 */
export const getMatchingBonusHistory = async (
  params: MatchingBonusHistoryParams = {}
): Promise<MatchingBonusHistoryResponse> => {
  const response = await axiosInstance.get('/matching-bonus/history', { params });
  return response.data;
};

/**
 * Get matching bonus source details (downline contributions)
 */
export const getMatchingBonusSourceDetails = async (
  incomeId: number
): Promise<{ success: boolean; data: MatchingBonusSourceDetail }> => {
  const response = await axiosInstance.get(`/matching-bonus/${incomeId}/details`);
  return response.data;
};

/**
 * Get matching bonus eligibility and rank info
 */
export const getMatchingEligibility = async (): Promise<{
  success: boolean;
  data: MatchingEligibility;
}> => {
  const response = await axiosInstance.get('/matching-bonus/eligibility');
  return response.data;
};

/**
 * Calculate potential matching bonus for current cycle
 */
export const calculateCurrentCycleBonus = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<{
  success: boolean;
  data: {
    eligible: boolean;
    period: { startDate: string; endDate: string };
    totalMatchingBonus: number;
    downlineCount: number;
    matchedCommissionsCount: number;
    details: any[];
    eligibility: any;
  };
}> => {
  const response = await axiosInstance.get('/matching-bonus/calculate-current', { params });
  return response.data;
};

/**
 * Export matching bonus data
 */
export const exportMatchingBonus = async (params?: {
  startDate?: string;
  endDate?: string;
  cyclePreset?: string;
  includeDetails?: boolean;
}): Promise<{ success: boolean; data: any[]; count: number }> => {
  const response = await axiosInstance.get('/matching-bonus/export', {
    params: {
      ...params,
      includeDetails: params?.includeDetails ? 'true' : 'false'
    }
  });
  return response.data;
};
