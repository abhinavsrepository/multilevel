import { apiGet } from './config/apiClient';

export interface ClubStatus {
  currentClub: 'NONE' | 'SILVER' | 'GOLD' | 'DIAMOND';
  qualified: boolean;
  nextClub: 'SILVER' | 'GOLD' | 'DIAMOND' | null;
  groups: Array<{
    userId: number;
    username: string;
    volume: number;
  }>;
  totalGBV: number;
  clubProgress: {
    group1: number;
    group2: number;
    group3: number;
  };
  thresholds: {
    SILVER: number;
    GOLD: number;
    DIAMOND: number;
  };
}

export interface ClubIncome {
  id: number;
  commissionId: string;
  userId: number;
  commissionType: string;
  amount: number;
  baseAmount: number;
  percentage: number;
  description: string;
  status: string;
  createdAt: string;
}

/**
 * Get current user's club status and progress
 */
export const getMyClubStatus = async (): Promise<{ success: boolean; data: ClubStatus }> => {
  return apiGet<{ success: boolean; data: ClubStatus }>('/club/status');
};

/**
 * Get club income history
 */
export const getMyClubIncome = async (page: number = 1, limit: number = 10): Promise<{
  success: boolean;
  data: {
    commissions: ClubIncome[];
    total: number;
    page: number;
    limit: number;
  }
}> => {
  return apiGet(`/club/income?page=${page}&limit=${limit}`);
};
