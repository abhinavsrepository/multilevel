import { apiGet, apiPost } from './config/axiosConfig';
import { ApiResponse } from '@/types';

export interface EPin {
  id: number;
  pinCode: string;
  amount: number;
  generatedBy: number;
  generatedFrom: 'ADMIN' | 'WALLET' | 'DEPOSIT';
  status: 'AVAILABLE' | 'USED' | 'EXPIRED' | 'BLOCKED';
  usedBy?: number;
  activatedUserId?: number;
  usedAt?: string;
  transactionFee: number;
  expiryDate?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  ActivatedUser?: {
    firstName: string;
    lastName: string;
    username: string;
  };
}

export interface EPinStats {
  totalGenerated: number;
  totalUsed: number;
  totalAvailable: number;
  totalExpired: number;
  totalValue: number;
}

/**
 * Generate E-Pin from wallet
 */
export const generateEPinFromWallet = async (amount: number): Promise<ApiResponse<{ epin: EPin; transactionFee: number }>> => {
  return apiPost<ApiResponse<any>>('/epins/generate', { amount });
};

/**
 * Get my E-Pins
 */
export const getMyEPins = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ApiResponse<{ data: EPin[]; total: number }>> => {
  return apiGet<ApiResponse<any>>('/epins/my-pins', params);
};

/**
 * Verify E-Pin
 */
export const verifyEPin = async (pinCode: string): Promise<ApiResponse<{
  valid: boolean;
  epin?: EPin;
  message?: string;
}>> => {
  return apiPost<ApiResponse<any>>('/epins/verify', { pinCode });
};

/**
 * Activate user with E-Pin
 */
export const activateUserWithEPin = async (pinCode: string, userId: number): Promise<ApiResponse<{
  message: string;
  walletCredited: number;
}>> => {
  return apiPost<ApiResponse<any>>('/epins/activate', { pinCode, userId });
};

/**
 * Get my E-Pin stats
 */
export const getMyEPinStats = async (): Promise<ApiResponse<EPinStats>> => {
  return apiGet<ApiResponse<EPinStats>>('/epins/stats');
};
