import axiosInstance from './axiosConfig';

export interface WalletBalance {
  userId: string;
  balance: number;
  currency: string;
  lockedBalance: number;
  availableBalance: number;
  lastUpdated: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  transactionType:
    | 'INVESTMENT'
    | 'RETURN'
    | 'COMMISSION'
    | 'WITHDRAWAL'
    | 'REFUND'
    | 'DEPOSIT'
    | 'BONUS';
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  referenceId?: string;
  balanceAfter: number;
  createdAt: string;
}

export interface TransactionFilters {
  type?: 'CREDIT' | 'DEBIT';
  transactionType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface WalletSummary {
  totalCredits: number;
  totalDebits: number;
  totalCommissions: number;
  totalReturns: number;
  totalWithdrawals: number;
  monthlyStats: Array<{
    month: string;
    credits: number;
    debits: number;
  }>;
  recentTransactions: WalletTransaction[];
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

const walletApi = {
  /**
   * Get wallet balance
   */
  getBalance: async (): Promise<ApiResponse<WalletBalance>> => {
    const response = await axiosInstance.get<ApiResponse<WalletBalance>>('/wallet/balance');
    return response.data;
  },

  /**
   * Get wallet transactions
   */
  getTransactions: async (params?: TransactionFilters): Promise<ApiResponse<WalletTransaction[]>> => {
    const response = await axiosInstance.get<ApiResponse<WalletTransaction[]>>('/wallet/transactions', {
      params,
    });
    return response.data;
  },

  /**
   * Get wallet summary
   */
  getSummary: async (): Promise<ApiResponse<WalletSummary>> => {
    const response = await axiosInstance.get<ApiResponse<WalletSummary>>('/wallet/summary');
    return response.data;
  },
};

export default walletApi;
