import { apiGet, apiPost, apiDelete } from './config/axiosConfig';
import { ApiResponse } from '@/types';

export interface Deposit {
  id: number;
  userId: number;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'CARD' | 'CRYPTO' | 'OTHER';
  transactionId?: string;
  paymentProof?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
  epinGenerated: boolean;
  epinId?: number;
  createdAt: string;
  updatedAt: string;
  EPin?: {
    pinCode: string;
    amount: number;
  };
}

/**
 * Submit deposit request
 */
export const submitDepositRequest = async (data: {
  amount: number;
  paymentMethod: string;
  transactionId?: string;
}): Promise<ApiResponse<Deposit>> => {
  return apiPost<ApiResponse<Deposit>>('/deposits', data);
};

/**
 * Upload payment proof
 */
export const uploadPaymentProof = async (depositId: number, file: File): Promise<ApiResponse<Deposit>> => {
  const formData = new FormData();
  formData.append('paymentProof', file);
  formData.append('depositId', String(depositId));

  return apiPost<ApiResponse<Deposit>>('/deposits/upload-proof', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Get my deposits
 */
export const getMyDeposits = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ApiResponse<{ data: Deposit[]; total: number }>> => {
  return apiGet<ApiResponse<any>>('/deposits/my-deposits', params);
};

/**
 * Get deposit details
 */
export const getDepositDetails = async (id: number): Promise<ApiResponse<Deposit>> => {
  return apiGet<ApiResponse<Deposit>>(`/deposits/${id}`);
};

/**
 * Cancel deposit
 */
export const cancelDeposit = async (id: number): Promise<ApiResponse<{message: string}>> => {
  return apiDelete<ApiResponse<any>>(`/deposits/${id}/cancel`);
};
