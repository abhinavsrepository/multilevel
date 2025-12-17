import axiosInstance from './axiosConfig';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  referralCode: string;
  sponsorId?: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isActive: boolean;
  createdAt: string;
}

export interface UpdateProfileData {
  fullName?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface DashboardData {
  totalInvestment: number;
  activeInvestments: number;
  totalReturns: number;
  walletBalance: number;
  directReferrals: number;
  teamSize: number;
  pendingCommissions: number;
  monthlyEarnings: number;
  investmentGrowth: Array<{
    month: string;
    amount: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    date: string;
  }>;
}

export interface TeamCount {
  directCount: number;
  leftTeamCount: number;
  rightTeamCount: number;
  totalTeamCount: number;
}

export interface DirectReferral {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  referralCode: string;
  totalInvestment: number;
  isActive: boolean;
  joinedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const userApi = {
  /**
   * Get user profile
   */
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>('/users/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<ApiResponse<UserProfile>> => {
    const response = await axiosInstance.put<ApiResponse<UserProfile>>('/users/profile', data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordData): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put<ApiResponse<null>>('/users/change-password', data);
    return response.data;
  },

  /**
   * Get dashboard data
   */
  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await axiosInstance.get<ApiResponse<DashboardData>>('/users/dashboard');
    return response.data;
  },

  /**
   * Get team count statistics
   */
  getTeamCount: async (): Promise<ApiResponse<TeamCount>> => {
    const response = await axiosInstance.get<ApiResponse<TeamCount>>('/users/team-count');
    return response.data;
  },

  /**
   * Get direct referrals
   */
  getDirectReferrals: async (): Promise<ApiResponse<DirectReferral[]>> => {
    const response = await axiosInstance.get<ApiResponse<DirectReferral[]>>('/users/direct-referrals');
    return response.data;
  },
};

export default userApi;
