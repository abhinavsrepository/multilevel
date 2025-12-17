import axiosInstance from './axiosConfig';

export interface WithdrawalRequestData {
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'WALLET';
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  upiId?: string;
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'WALLET';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  requestDate: string;
  processedDate?: string;
  completedDate?: string;
  rejectionReason?: string;
  transactionId?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  upiId?: string;
  adminNotes?: string;
}

export interface PayoutFilters {
  status?: string;
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
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

const payoutApi = {
  /**
   * Request a withdrawal
   */
  requestWithdrawal: async (data: WithdrawalRequestData): Promise<ApiResponse<Payout>> => {
    const response = await axiosInstance.post<ApiResponse<Payout>>('/payouts/request', data);
    return response.data;
  },

  /**
   * Get payout history
   */
  getHistory: async (params?: PayoutFilters): Promise<ApiResponse<Payout[]>> => {
    const response = await axiosInstance.get<ApiResponse<Payout[]>>('/payouts/history', {
      params,
    });
    return response.data;
  },

  /**
   * Get payout details by ID
   */
  getPayoutDetails: async (payoutId: string): Promise<ApiResponse<Payout>> => {
    const response = await axiosInstance.get<ApiResponse<Payout>>(`/payouts/${payoutId}`);
    return response.data;
  },
};

export default payoutApi;
