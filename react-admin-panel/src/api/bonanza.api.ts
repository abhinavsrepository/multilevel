import axios from './axiosConfig';

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
  id?: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  qualificationCriteria: BonanzaCriteria;
  rewardType: 'FIXED' | 'PERCENTAGE' | 'POOL_SHARE' | 'ITEM';
  rewardAmount?: number;
  rewardDescription?: string;
  totalPoolAmount?: number;
  status?: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'UPCOMING' | 'CANCELLED';
  maxQualifiers?: number;
  currentQualifiers?: number;
  periodType?: 'FIXED_DATES' | 'FROM_JOIN_DATE' | 'QUARTERLY' | 'MONTHLY';
  periodDays?: number;
  isVisible?: boolean;
  priority?: number;
  bannerImage?: string;
  iconImage?: string;
  notes?: string;
  totalPaidOut?: number;
  createdAt?: string;
  updatedAt?: string;
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
  rank?: number;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
}

export interface DashboardData {
  bonanza: Bonanza;
  leaderboard: any[];
  stats: {
    byStatus: Array<{ status: string; count: number; avgProgress: number }>;
    totalPaidOut: number;
    projectedPayout: number;
    currentQualifiers: number;
    maxQualifiers?: number;
    remainingSlots?: number | null;
  };
  trends: {
    dailyProgress: Array<{ date: string; activeUsers: number; avgProgress: number }>;
  };
}

export interface BonanzaStatistics {
  overview: {
    totalBonanzas: number;
    activeBonanzas: number;
    upcomingBonanzas: number;
    totalPaidOut: number;
    totalQualifiers: number;
  };
  topPerforming: Array<{
    id: number;
    name: string;
    currentQualifiers: number;
    totalPaidOut: number;
    status: string;
  }>;
}

// API Functions

/**
 * Get all bonanzas with filters and pagination
 */
export const getAllBonanzas = async (params?: {
  status?: string;
  periodType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const response = await axios.get('/bonanza/admin', { params });
  return response.data;
};

/**
 * Get single bonanza by ID with detailed stats
 */
export const getBonanzaById = async (id: number) => {
  const response = await axios.get(`/bonanza/admin/${id}`);
  return response.data;
};

/**
 * Create new bonanza
 */
export const createBonanza = async (bonanza: Bonanza) => {
  const response = await axios.post('/bonanza/admin', bonanza);
  return response.data;
};

/**
 * Update bonanza
 */
export const updateBonanza = async (id: number, bonanza: Partial<Bonanza>) => {
  const response = await axios.put(`/bonanza/admin/${id}`, bonanza);
  return response.data;
};

/**
 * Delete bonanza
 */
export const deleteBonanza = async (id: number) => {
  const response = await axios.delete(`/bonanza/admin/${id}`);
  return response.data;
};

/**
 * Get bonanza qualifiers (participants) with filters
 */
export const getBonanzaQualifiers = async (
  id: number,
  params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }
) => {
  const response = await axios.get(`/bonanza/admin/${id}/qualifiers`, { params });
  return response.data;
};

/**
 * Get real-time tracking dashboard data
 */
export const getBonanzaDashboard = async (id: number): Promise<{ success: boolean; data: DashboardData }> => {
  const response = await axios.get(`/bonanza/admin/${id}/dashboard`);
  return response.data;
};

/**
 * Manual award bonanza to user
 */
export const manualAwardBonanza = async (
  bonanzaId: number,
  userId: number,
  reason: string
) => {
  const response = await axios.post(`/bonanza/admin/${bonanzaId}/manual-award`, {
    userId,
    reason
  });
  return response.data;
};

/**
 * Trigger status update manually
 */
export const updateBonanzaStatuses = async () => {
  const response = await axios.post('/bonanza/admin/update-statuses');
  return response.data;
};

/**
 * Get bonanza statistics overview
 */
export const getBonanzaStatistics = async (): Promise<{ success: boolean; data: BonanzaStatistics }> => {
  const response = await axios.get('/bonanza/admin/statistics');
  return response.data;
};

export default {
  getAllBonanzas,
  getBonanzaById,
  createBonanza,
  updateBonanza,
  deleteBonanza,
  getBonanzaQualifiers,
  getBonanzaDashboard,
  manualAwardBonanza,
  updateBonanzaStatuses,
  getBonanzaStatistics
};
