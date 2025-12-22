import { apiGet, apiPost, apiDelete } from './config/axiosConfig';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  Withdrawal,
  WithdrawalRequest,
  WithdrawalStatus,
  WithdrawalRules,
} from '@/types';

// ==================== Withdrawal Request APIs ====================

/**
 * Create new withdrawal request
 */
export const createWithdrawalRequest = async (data: WithdrawalRequest): Promise<ApiResponse<Withdrawal>> => {
  return apiPost<ApiResponse<Withdrawal>>('/withdrawals', data);
};

/**
 * Calculate withdrawal charges
 */
export const calculateWithdrawalCharges = async (amount: number): Promise<ApiResponse<{
  requestedAmount: number;
  tds: number;
  tdsPercentage: number;
  adminCharge: number;
  adminChargePercentage: number;
  netAmount: number;
  applicableTDS: boolean;
  tdsThreshold: number;
}>> => {
  return apiGet<ApiResponse<{
    requestedAmount: number;
    tds: number;
    tdsPercentage: number;
    adminCharge: number;
    adminChargePercentage: number;
    netAmount: number;
    applicableTDS: boolean;
    tdsThreshold: number;
  }>>('/withdrawals/calculate-charges', { amount });
};

/**
 * Check withdrawal eligibility
 */
export const checkWithdrawalEligibility = async (amount: number): Promise<ApiResponse<{
  eligible: boolean;
  reason?: string;
  availableBalance: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  dailyLimit: number;
  dailyUsed: number;
  dailyRemaining: number;
  kycRequired: boolean;
  kycStatus: string;
}>> => {
  // Since there is no direct check-eligibility endpoint, we derive it from limits
  const response = await apiGet<ApiResponse<any>>('/withdrawals/limits');

  if (!response.data) {
    throw new Error('Failed to fetch withdrawal limits');
  }

  const { minAmount, maxAmount, availableBalance } = response.data;

  let eligible = true;
  let reason = '';

  if (amount < minAmount) {
    eligible = false;
    reason = `Minimum withdrawal amount is ${minAmount}`;
  } else if (amount > maxAmount) {
    eligible = false;
    reason = `Maximum withdrawal amount is ${maxAmount}`;
  } else if (amount > availableBalance) {
    eligible = false;
    reason = 'Insufficient balance';
  }

  return {
    success: true,
    data: {
      eligible,
      reason,
      availableBalance,
      minWithdrawal: minAmount,
      maxWithdrawal: maxAmount,
      dailyLimit: maxAmount, // Assuming daily limit same as max amount for now
      dailyUsed: 0,
      dailyRemaining: maxAmount,
      kycRequired: true,
      kycStatus: 'VERIFIED' // Mocked for now
    }
  };
};

// ==================== Withdrawal History APIs ====================

/**
 * Get all withdrawal requests with pagination and filters
 */
export const getWithdrawals = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: WithdrawalStatus;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedResponse<Withdrawal>> => {
  return apiGet<PaginatedResponse<Withdrawal>>('/withdrawals/my-withdrawals', params);
};

/**
 * Get withdrawal by ID
 */
export const getWithdrawalById = async (withdrawalId: number): Promise<ApiResponse<Withdrawal>> => {
  return apiGet<ApiResponse<Withdrawal>>(`/withdrawals/${withdrawalId}`);
};

/**
 * Get withdrawal by withdrawal ID string
 */
export const getWithdrawalByWithdrawalId = async (withdrawalId: string): Promise<ApiResponse<Withdrawal>> => {
  // Backend doesn't support code lookup yet, try ID lookup or fail gracefully
  try {
    return apiGet<ApiResponse<Withdrawal>>(`/withdrawals/${withdrawalId}`);
  } catch (e) {
    throw new Error('Lookup by code not supported');
  }
};

/**
 * Get pending withdrawals
 */
export const getPendingWithdrawals = async (params?: PaginationParams): Promise<PaginatedResponse<Withdrawal>> => {
  return apiGet<PaginatedResponse<Withdrawal>>('/withdrawals/my-withdrawals', { ...params, status: 'PENDING' });
};

/**
 * Get approved withdrawals
 */
export const getApprovedWithdrawals = async (params?: PaginationParams): Promise<PaginatedResponse<Withdrawal>> => {
  return apiGet<PaginatedResponse<Withdrawal>>('/withdrawals/my-withdrawals', { ...params, status: 'APPROVED' });
};

/**
 * Get completed withdrawals
 */
export const getCompletedWithdrawals = async (params?: PaginationParams): Promise<PaginatedResponse<Withdrawal>> => {
  return apiGet<PaginatedResponse<Withdrawal>>('/withdrawals/my-withdrawals', { ...params, status: 'COMPLETED' });
};

/**
 * Get rejected withdrawals
 */
export const getRejectedWithdrawals = async (params?: PaginationParams): Promise<PaginatedResponse<Withdrawal>> => {
  return apiGet<PaginatedResponse<Withdrawal>>('/withdrawals/my-withdrawals', { ...params, status: 'REJECTED' });
};

/**
 * Get cancelled withdrawals
 */
export const getCancelledWithdrawals = async (params?: PaginationParams): Promise<PaginatedResponse<Withdrawal>> => {
  return apiGet<PaginatedResponse<Withdrawal>>('/withdrawals/my-withdrawals', { ...params, status: 'CANCELLED' });
};

// ==================== Withdrawal Actions APIs ====================

/**
 * Cancel withdrawal request (only for pending requests)
 */
export const cancelWithdrawal = async (withdrawalId: number, _reason: string): Promise<ApiResponse<Withdrawal>> => {
  // Backend uses DELETE for cancel, reason is currently ignored by backend
  return apiDelete<ApiResponse<Withdrawal>>(`/withdrawals/${withdrawalId}/cancel`);
};

/**
 * Resubmit rejected withdrawal
 */
export const resubmitWithdrawal = async (_withdrawalId: number, data?: Partial<WithdrawalRequest>): Promise<ApiResponse<Withdrawal>> => {
  // Not supported by backend yet, assume create new
  return createWithdrawalRequest(data as WithdrawalRequest);
};

// ==================== Withdrawal Statistics APIs ====================

/**
 * Get withdrawal statistics
 */
export const getWithdrawalStats = async (): Promise<ApiResponse<{
  totalWithdrawals: number;
  totalWithdrawnAmount: number;
  totalTDS: number;
  totalCharges: number;
  totalNetAmount: number;
  pendingCount: number;
  pendingAmount: number;
  completedCount: number;
  completedAmount: number;
  rejectedCount: number;
  rejectedAmount: number;
  thisMonthCount: number;
  thisMonthAmount: number;
}>> => {
  return apiGet<ApiResponse<{
    totalWithdrawals: number;
    totalWithdrawnAmount: number;
    totalTDS: number;
    totalCharges: number;
    totalNetAmount: number;
    pendingCount: number;
    pendingAmount: number;
    completedCount: number;
    completedAmount: number;
    rejectedCount: number;
    rejectedAmount: number;
    thisMonthCount: number;
    thisMonthAmount: number;
  }>>('/payouts/stats');
};

/**
 * Get monthly withdrawal summary
 */
export const getMonthlyWithdrawalSummary = async (params?: {
  year?: number;
  month?: number;
}): Promise<ApiResponse<{
  requestCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalRequested: number;
  totalApproved: number;
  totalWithdrawn: number;
  totalTDS: number;
  totalCharges: number;
}>> => {
  return apiGet<ApiResponse<{
    requestCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalRequested: number;
    totalApproved: number;
    totalWithdrawn: number;
    totalTDS: number;
    totalCharges: number;
  }>>('/payouts/stats/monthly', params);
};

/**
 * Get withdrawal trends
 */
export const getWithdrawalTrends = async (params?: {
  period?: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
}): Promise<ApiResponse<{
  date: string;
  count: number;
  amount: number;
  netAmount: number;
}[]>> => {
  return apiGet<ApiResponse<{
    date: string;
    count: number;
    amount: number;
    netAmount: number;
  }[]>>('/payouts/stats/trends', params);
};

// ==================== Withdrawal Rules & Settings APIs ====================

/**
 * Get withdrawal rules
 */
export const getWithdrawalRules = async (): Promise<ApiResponse<WithdrawalRules>> => {
  return apiGet<ApiResponse<WithdrawalRules>>('/withdrawals/limits');
};

/**
 * Get withdrawal limits
 */
export const getWithdrawalLimits = async (): Promise<ApiResponse<{
  minWithdrawal: number;
  maxWithdrawal: number;
  dailyLimit: number;
  dailyUsed: number;
  dailyRemaining: number;
  monthlyLimit: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  availableBalance: number;
}>> => {
  return apiGet<ApiResponse<{
    minWithdrawal: number;
    maxWithdrawal: number;
    dailyLimit: number;
    dailyUsed: number;
    dailyRemaining: number;
    monthlyLimit: number;
    monthlyUsed: number;
    monthlyRemaining: number;
    availableBalance: number;
  }>>('/withdrawals/limits');
};

// ==================== Payment Method APIs ====================

/**
 * Get available payment methods for withdrawal
 */
export const getWithdrawalPaymentMethods = async (): Promise<ApiResponse<{
  bankTransfer: {
    enabled: boolean;
    accounts: any[];
  };
  upi: {
    enabled: boolean;
    savedUPIs: string[];
  };
}>> => {
  return apiGet<ApiResponse<{
    bankTransfer: {
      enabled: boolean;
      accounts: any[];
    };
    upi: {
      enabled: boolean;
      savedUPIs: string[];
    };
  }>>('/payouts/payment-methods');
};

/**
 * Validate UPI ID
 */
export const validateUPIId = async (upiId: string): Promise<ApiResponse<{
  valid: boolean;
  name?: string;
}>> => {
  return apiPost<ApiResponse<{
    valid: boolean;
    name?: string;
  }>>('/payouts/validate-upi', { upiId });
};

// ==================== Withdrawal Timeline APIs ====================

/**
 * Get withdrawal timeline
 */
export const getWithdrawalTimeline = async (withdrawalId: number): Promise<ApiResponse<{
  status: WithdrawalStatus;
  date?: string;
  note?: string;
}[]>> => {
  return apiGet<ApiResponse<{
    status: WithdrawalStatus;
    date?: string;
    note?: string;
  }[]>>(`/payouts/withdrawals/${withdrawalId}/timeline`);
};

// ==================== Withdrawal Receipt APIs ====================

/**
 * Download withdrawal receipt
 */
export const downloadWithdrawalReceipt = async (withdrawalId: number): Promise<Blob> => {
  const response = await fetch(`/api/payouts/withdrawals/${withdrawalId}/receipt/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

/**
 * Email withdrawal receipt
 */
export const emailWithdrawalReceipt = async (withdrawalId: number, email?: string): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/payouts/withdrawals/${withdrawalId}/receipt/email`, { email });
};

// ==================== TDS Certificate APIs ====================

/**
 * Get TDS certificates
 */
export const getTDSCertificates = async (params?: {
  year?: number;
  quarter?: number;
}): Promise<ApiResponse<{
  year: number;
  quarter: number;
  totalTDS: number;
  certificateUrl?: string;
  generatedDate?: string;
}[]>> => {
  return apiGet<ApiResponse<{
    year: number;
    quarter: number;
    totalTDS: number;
    certificateUrl?: string;
    generatedDate?: string;
  }[]>>('/payouts/tds-certificates', params);
};

/**
 * Download TDS certificate
 */
export const downloadTDSCertificate = async (year: number, quarter: number): Promise<Blob> => {
  const response = await fetch(`/api/payouts/tds-certificates/${year}/Q${quarter}/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

/**
 * Request TDS certificate generation
 */
export const requestTDSCertificate = async (year: number, quarter: number): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/payouts/tds-certificates/request', { year, quarter });
};

// ==================== Payout Schedule APIs ====================

/**
 * Get payout schedule/cycle information
 */
export const getPayoutSchedule = async (): Promise<ApiResponse<{
  cycleType: 'INSTANT' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  processingDays: string[];
  cutoffTime: string;
  minimumProcessingTime: string;
  maximumProcessingTime: string;
  nextPayoutDate?: string;
}>> => {
  return apiGet<ApiResponse<{
    cycleType: 'INSTANT' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    processingDays: string[];
    cutoffTime: string;
    minimumProcessingTime: string;
    maximumProcessingTime: string;
    nextPayoutDate?: string;
  }>>('/payouts/schedule');
};
