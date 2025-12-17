import axiosInstance from './axiosConfig';

export interface Commission {
  id: string;
  userId: string;
  fromUserId: string;
  fromUser?: {
    id: string;
    fullName: string;
    email: string;
  };
  investmentId?: string;
  investment?: {
    id: string;
    propertyTitle: string;
    amount: number;
  };
  commissionType:
    | 'DIRECT_REFERRAL'
    | 'BINARY_LEFT'
    | 'BINARY_RIGHT'
    | 'LEVEL_COMMISSION'
    | 'PERFORMANCE_BONUS'
    | 'LEADERSHIP_BONUS';
  amount: number;
  percentage: number;
  level?: number;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  earnedDate: string;
  paidDate?: string;
}

export interface CommissionFilters {
  commissionType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface CommissionSummary {
  totalEarned: number;
  totalPaid: number;
  totalPending: number;
  byType: Array<{
    type: string;
    amount: number;
    count: number;
  }>;
  monthlyEarnings: Array<{
    month: string;
    amount: number;
  }>;
  topEarners: Array<{
    userId: string;
    userName: string;
    totalCommission: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const commissionApi = {
  /**
   * Get commission history
   */
  getHistory: async (params?: CommissionFilters): Promise<ApiResponse<Commission[]>> => {
    const response = await axiosInstance.get<ApiResponse<Commission[]>>('/commissions/history', {
      params,
    });
    return response.data;
  },

  /**
   * Get commission summary
   */
  getSummary: async (): Promise<ApiResponse<CommissionSummary>> => {
    const response = await axiosInstance.get<ApiResponse<CommissionSummary>>('/commissions/summary');
    return response.data;
  },

  /**
   * Get commissions by type
   */
  getByType: async (type: string): Promise<ApiResponse<Commission[]>> => {
    const response = await axiosInstance.get<ApiResponse<Commission[]>>(`/commissions/by-type/${type}`);
    return response.data;
  },
};

export default commissionApi;
