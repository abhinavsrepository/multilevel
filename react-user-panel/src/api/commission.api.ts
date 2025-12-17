import { apiGet } from './config/axiosConfig';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  Commission,
  CommissionSummary,
  CommissionType,
  CommissionStatus,
  CommissionFilters,
  CommissionStats,
} from '@/types';

// ==================== Commission Summary APIs ====================

/**
 * Get commission summary
 */
export const getCommissionSummary = async (): Promise<ApiResponse<CommissionSummary>> => {
  return apiGet<ApiResponse<CommissionSummary>>('/commissions/summary');
};

/**
 * Get commission by type breakdown
 */
export const getCommissionByType = async (): Promise<ApiResponse<{
  type: CommissionType;
  name: string;
  icon: string;
  totalEarned: number;
  thisMonth: number;
  count: number;
  color: string;
}[]>> => {
  return apiGet<ApiResponse<{
    type: CommissionType;
    name: string;
    icon: string;
    totalEarned: number;
    thisMonth: number;
    count: number;
    color: string;
  }[]>>('/commissions/by-type');
};

/**
 * Get commission distribution
 */
export const getCommissionDistribution = async (): Promise<ApiResponse<{
  type: CommissionType;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}[]>> => {
  return apiGet<ApiResponse<{
    type: CommissionType;
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }[]>>('/commissions/distribution');
};

/**
 * Get commission trends
 */
export const getCommissionTrends = async (params?: {
  period?: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
}): Promise<ApiResponse<{
  date: string;
  total: number;
  direct: number;
  binary: number;
  level: number;
  rental: number;
  appreciation: number;
  rank: number;
  leadership: number;
}[]>> => {
  return apiGet<ApiResponse<{
    date: string;
    total: number;
    direct: number;
    binary: number;
    level: number;
    rental: number;
    appreciation: number;
    rank: number;
    leadership: number;
  }[]>>('/commissions/trends', params);
};

// ==================== Commission History APIs ====================

/**
 * Get all commissions with pagination and filters
 */
export const getCommissions = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
} & Partial<CommissionFilters>): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>('/commissions/history', params);
};

/**
 * Get commission by ID
 */
export const getCommissionById = async (commissionId: number): Promise<ApiResponse<Commission>> => {
  return apiGet<ApiResponse<Commission>>(`/commissions/${commissionId}`);
};

/**
 * Get commission by commission ID string
 */
export const getCommissionByCommissionId = async (commissionId: string): Promise<ApiResponse<Commission>> => {
  return apiGet<ApiResponse<Commission>>(`/commissions/code/${commissionId}`);
};

/**
 * Get commissions by type
 */
export const getCommissionsByType = async (
  type: CommissionType,
  params?: PaginationParams
): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>(`/commissions/type/${type}`, params);
};

/**
 * Get commissions by status
 */
export const getCommissionsByStatus = async (
  status: CommissionStatus,
  params?: PaginationParams
): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>(`/commissions/status/${status}`, params);
};

/**
 * Get pending commissions
 */
export const getPendingCommissions = async (params?: PaginationParams): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>('/commissions/pending', params);
};

/**
 * Get approved commissions
 */
export const getApprovedCommissions = async (params?: PaginationParams): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>('/commissions/approved', params);
};

/**
 * Get paid commissions
 */
export const getPaidCommissions = async (params?: PaginationParams): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>('/commissions/paid', params);
};

/**
 * Get rejected commissions
 */
export const getRejectedCommissions = async (params?: PaginationParams): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>('/commissions/rejected', params);
};

// ==================== Commission Type Specific APIs ====================

/**
 * Get direct referral commissions
 */
export const getDirectReferralCommissions = async (params?: PaginationParams): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>('/commissions/direct-referral', params);
};

/**
 * Get binary pairing commissions
 */
export const getBinaryPairingCommissions = async (params?: PaginationParams): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>('/commissions/binary-pairing', params);
};

/**
 * Get level commissions
 */
export const getLevelCommissions = async (params?: {
  page?: number;
  size?: number;
  level?: number;
}): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>('/commissions/level', params);
};

/**
 * Get rental income commissions
 */
export const getRentalIncomeCommissions = async (params?: PaginationParams): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>('/commissions/rental-income', params);
};

/**
 * Get property appreciation commissions
 */
export const getPropertyAppreciationCommissions = async (params?: PaginationParams): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>('/commissions/property-appreciation', params);
};

/**
 * Get rank bonus commissions
 */
export const getRankBonusCommissions = async (params?: PaginationParams): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>('/commissions/rank-bonus', params);
};

/**
 * Get leadership bonus commissions
 */
export const getLeadershipBonusCommissions = async (params?: PaginationParams): Promise<PaginatedResponse<Commission>> => {
  return apiGet<PaginatedResponse<Commission>>('/commissions/leadership-bonus', params);
};

// ==================== Commission Statistics APIs ====================

/**
 * Get commission statistics
 */
export const getCommissionStats = async (): Promise<ApiResponse<CommissionStats>> => {
  return apiGet<ApiResponse<CommissionStats>>('/commissions/stats');
};

/**
 * Get monthly commission summary
 */
export const getMonthlyCommissionSummary = async (params?: {
  year?: number;
  month?: number;
}): Promise<ApiResponse<{
  totalEarnings: number;
  byType: {
    type: CommissionType;
    amount: number;
    count: number;
  }[];
  byStatus: {
    status: CommissionStatus;
    amount: number;
    count: number;
  }[];
  paid: number;
  pending: number;
}>> => {
  return apiGet<ApiResponse<{
    totalEarnings: number;
    byType: {
      type: CommissionType;
      amount: number;
      count: number;
    }[];
    byStatus: {
      status: CommissionStatus;
      amount: number;
      count: number;
    }[];
    paid: number;
    pending: number;
  }>>('/commissions/stats/monthly', params);
};

/**
 * Get today's commission earnings
 */
export const getTodayCommissions = async (): Promise<ApiResponse<{
  total: number;
  count: number;
  byType: {
    type: CommissionType;
    amount: number;
    count: number;
  }[];
}>> => {
  return apiGet<ApiResponse<{
    total: number;
    count: number;
    byType: {
      type: CommissionType;
      amount: number;
      count: number;
    }[];
  }>>('/commissions/today');
};

/**
 * Get this week's commission earnings
 */
export const getWeeklyCommissions = async (): Promise<ApiResponse<{
  total: number;
  count: number;
  byType: {
    type: CommissionType;
    amount: number;
    count: number;
  }[];
}>> => {
  return apiGet<ApiResponse<{
    total: number;
    count: number;
    byType: {
      type: CommissionType;
      amount: number;
      count: number;
    }[];
  }>>('/commissions/weekly');
};

/**
 * Get this month's commission earnings
 */
export const getMonthlyCommissions = async (): Promise<ApiResponse<{
  total: number;
  count: number;
  byType: {
    type: CommissionType;
    amount: number;
    count: number;
  }[];
}>> => {
  return apiGet<ApiResponse<{
    total: number;
    count: number;
    byType: {
      type: CommissionType;
      amount: number;
      count: number;
    }[];
  }>>('/commissions/monthly');
};

// ==================== Binary Commission Specific APIs ====================

/**
 * Get binary pairing details
 */
export const getBinaryPairingDetails = async (): Promise<ApiResponse<{
  leftBV: number;
  rightBV: number;
  matchingBV: number;
  carryForward: number;
  pairingRatio: string;
  commissionPercentage: number;
  capping: {
    dailyLimit: number;
    dailyUsed: number;
    dailyRemaining: number;
  };
}>> => {
  return apiGet<ApiResponse<{
    leftBV: number;
    rightBV: number;
    matchingBV: number;
    carryForward: number;
    pairingRatio: string;
    commissionPercentage: number;
    capping: {
      dailyLimit: number;
      dailyUsed: number;
      dailyRemaining: number;
    };
  }>>('/commissions/binary/details');
};

/**
 * Get binary pairing history
 */
export const getBinaryPairingHistory = async (params?: PaginationParams): Promise<PaginatedResponse<{
  date: string;
  leftBV: number;
  rightBV: number;
  matchedBV: number;
  commissionRate: number;
  commissionAmount: number;
  cappingApplied: boolean;
  carryForward: number;
}>> => {
  return apiGet<PaginatedResponse<{
    date: string;
    leftBV: number;
    rightBV: number;
    matchedBV: number;
    commissionRate: number;
    commissionAmount: number;
    cappingApplied: boolean;
    carryForward: number;
  }>>('/commissions/binary/history', params);
};

// ==================== Level Commission Specific APIs ====================

/**
 * Get level commission breakdown
 */
export const getLevelCommissionBreakdown = async (): Promise<ApiResponse<{
  level: number;
  members: number;
  totalInvestment: number;
  commissionRate: number;
  totalEarned: number;
  thisMonth: number;
}[]>> => {
  return apiGet<ApiResponse<{
    level: number;
    members: number;
    totalInvestment: number;
    commissionRate: number;
    totalEarned: number;
    thisMonth: number;
  }[]>>('/commissions/level/breakdown');
};

// ==================== Commission Calculator APIs ====================

/**
 * Calculate potential commission
 */
export const calculateCommission = async (data: {
  investmentAmount: number;
  propertyId: number;
  commissionType: CommissionType;
}): Promise<ApiResponse<{
  baseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  bv?: number;
  cappingApplied: boolean;
  details: string;
}>> => {
  return apiGet<ApiResponse<{
    baseAmount: number;
    commissionRate: number;
    commissionAmount: number;
    bv?: number;
    cappingApplied: boolean;
    details: string;
  }>>('/commissions/calculate', data);
};

// ==================== Commission Report APIs ====================

/**
 * Download commission report
 */
export const downloadCommissionReport = async (params: {
  startDate: string;
  endDate: string;
  commissionType?: CommissionType;
  format: 'PDF' | 'EXCEL' | 'CSV';
}): Promise<Blob> => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    format: params.format,
    ...(params.commissionType && { commissionType: params.commissionType }),
  });

  const response = await fetch(`/api/commissions/report/download?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

/**
 * Email commission report
 */
export const emailCommissionReport = async (params: {
  startDate: string;
  endDate: string;
  commissionType?: CommissionType;
  email?: string;
}): Promise<ApiResponse> => {
  return apiGet<ApiResponse>('/commissions/report/email', params);
};

// ==================== Commission Receipt APIs ====================

/**
 * Download commission receipt
 */
export const downloadCommissionReceipt = async (commissionId: number): Promise<Blob> => {
  const response = await fetch(`/api/commissions/${commissionId}/receipt/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

/**
 * Email commission receipt
 */
export const emailCommissionReceipt = async (commissionId: number, email?: string): Promise<ApiResponse> => {
  return apiGet<ApiResponse>(`/commissions/${commissionId}/receipt/email`, { email });
};
