import { apiGet, apiPost, apiDelete } from './config/axiosConfig';
import { ApiResponse } from '@/types';

export interface Withdrawal {
  id: number;
  userId: number;
  amount: number;
  transactionCharge: number;
  netAmount: number;
  withdrawalType: 'BANK_TRANSFER' | 'UPI' | 'CRYPTO' | 'CHECK' | 'OTHER';
  bankAccountId?: number;
  status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  approvedBy?: number;
  approvedAt?: string;
  processedAt?: string;
  rejectionReason?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  BankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };
}

export interface WithdrawalLimits {
  minAmount: number;
  maxAmount: number;
  availableBalance: number;
  chargeType: string;
  chargeValue: number;
}

/**
 * Request withdrawal
 */
export const requestWithdrawal = async (data: {
  amount: number;
  withdrawalType: string;
  bankAccountId?: number;
}): Promise<ApiResponse<Withdrawal>> => {
  return apiPost<ApiResponse<Withdrawal>>('/withdrawals', data);
};

/**
 * Get my withdrawals
 */
export const getMyWithdrawals = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ApiResponse<{ data: Withdrawal[]; total: number }>> => {
  return apiGet<ApiResponse<any>>('/withdrawals/my-withdrawals', params);
};

/**
 * Get withdrawal limits
 */
export const getWithdrawalLimits = async (): Promise<ApiResponse<WithdrawalLimits>> => {
  return apiGet<ApiResponse<WithdrawalLimits>>('/withdrawals/limits');
};

/**
 * Calculate withdrawal charges
 */
export const calculateCharges = async (amount: number): Promise<ApiResponse<{
  amount: number;
  transactionCharge: number;
  netAmount: number;
}>> => {
  return apiGet<ApiResponse<any>>('/withdrawals/calculate-charges', { amount });
};

/**
 * Get withdrawal details
 */
export const getWithdrawalDetails = async (id: number): Promise<ApiResponse<Withdrawal>> => {
  return apiGet<ApiResponse<Withdrawal>>(`/withdrawals/${id}`);
};

/**
 * Cancel withdrawal
 */
export const cancelWithdrawal = async (id: number): Promise<ApiResponse<{message: string}>> => {
  return apiDelete<ApiResponse<any>>(`/withdrawals/${id}/cancel`);
};
