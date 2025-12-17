import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './config/axiosConfig';
import {
  ApiResponse,
  User,
  UserStats,
  RankProgress,
  KYCDocument,
  BankAccount,
  Session,
  LoginHistory,
  DocumentType,
  DashboardData,
} from '@/types';

// ==================== Dashboard APIs ====================

/**
 * Get dashboard data
 */
export const getDashboardData = async (): Promise<ApiResponse<DashboardData>> => {
  return apiGet<ApiResponse<DashboardData>>('/users/dashboard');
};

// ==================== User Profile APIs ====================

/**
 * Get current user profile
 */
export const getUserProfile = async (): Promise<ApiResponse<User>> => {
  return apiGet<ApiResponse<User>>('/users/profile');
};

/**
 * Update user profile
 */
export const updateUserProfile = async (data: Partial<User>): Promise<ApiResponse<User>> => {
  return apiPut<ApiResponse<User>>('/users/profile', data);
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<{ profilePicture: string }>> => {
  return apiUpload<ApiResponse<{ profilePicture: string }>>('/users/profile/picture', file, onProgress);
};

/**
 * Upload cover photo
 */
export const uploadCoverPhoto = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<{ coverPhoto: string }>> => {
  return apiUpload<ApiResponse<{ coverPhoto: string }>>('/users/profile/cover', file, onProgress);
};

/**
 * Delete profile picture
 */
export const deleteProfilePicture = async (): Promise<ApiResponse> => {
  return apiDelete<ApiResponse>('/users/profile/picture');
};

/**
 * Delete cover photo
 */
export const deleteCoverPhoto = async (): Promise<ApiResponse> => {
  return apiDelete<ApiResponse>('/users/profile/cover');
};

// ==================== User Statistics APIs ====================

/**
 * Get user statistics
 */
export const getUserStats = async (): Promise<ApiResponse<UserStats>> => {
  return apiGet<ApiResponse<UserStats>>('/users/stats');
};

/**
 * Get rank progress
 */
export const getRankProgress = async (): Promise<ApiResponse<RankProgress>> => {
  return apiGet<ApiResponse<RankProgress>>('/ranks/progress');
};

/**
 * Get available ranks
 */
export const getAvailableRanks = async (): Promise<ApiResponse<any[]>> => {
  return apiGet<ApiResponse<any[]>>('/ranks/available');
};

/**
 * Get my rank rewards
 */
export const getMyRewards = async (): Promise<ApiResponse<any>> => {
  return apiGet<ApiResponse<any>>('/rank-rewards/my-rewards');
};

/**
 * Get my reward statistics
 */
export const getMyRewardStats = async (): Promise<ApiResponse<any>> => {
  return apiGet<ApiResponse<any>>('/rank-rewards/my-stats');
};

/**
 * Get my rank achievements
 */
export const getMyAchievements = async (): Promise<ApiResponse<any>> => {
  return apiGet<ApiResponse<any>>('/rank-achievements/my-achievements');
};

/**
 * Get my achievement timeline
 */
export const getMyAchievementTimeline = async (): Promise<ApiResponse<any>> => {
  return apiGet<ApiResponse<any>>('/rank-achievements/my-timeline');
};

// ==================== KYC APIs ====================

/**
 * Get KYC status and documents
 */
export const getKYCStatus = async (): Promise<ApiResponse<{ kycStatus: string; kycLevel: string; documents: KYCDocument[] }>> => {
  return apiGet<ApiResponse<{ kycStatus: string; kycLevel: string; documents: KYCDocument[] }>>('/kyc/status');
};

/**
 * Get specific KYC document
 */
export const getKYCDocument = async (documentType: DocumentType): Promise<ApiResponse<KYCDocument>> => {
  return apiGet<ApiResponse<KYCDocument>>(`/kyc/documents/${documentType}`);
};

/**
 * Upload KYC document
 */
export const uploadKYCDocument = async (
  documentType: DocumentType,
  data: {
    documentNumber?: string;
    frontImage: File;
    backImage?: File;
  },
  onProgress?: (progress: number) => void
): Promise<ApiResponse<KYCDocument>> => {
  const formData = new FormData();
  formData.append('documentType', documentType);
  if (data.documentNumber) {
    formData.append('documentNumber', data.documentNumber);
  }
  formData.append('file', data.frontImage); // Backend expects 'file'
  if (data.backImage) {
    formData.append('backImage', data.backImage);
  }

  return apiPost<ApiResponse<KYCDocument>>('/kyc/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      }
    },
  });
};



/**
 * Delete KYC document
 */
export const deleteKYCDocument = async (documentType: DocumentType): Promise<ApiResponse> => {
  return apiDelete<ApiResponse>(`/users/kyc/documents/${documentType}`);
};

// ==================== Bank Account APIs ====================

/**
 * Get all bank accounts
 */
export const getBankAccounts = async (): Promise<ApiResponse<BankAccount[]>> => {
  return apiGet<ApiResponse<BankAccount[]>>('/users/bank-accounts');
};

/**
 * Get specific bank account
 */
export const getBankAccount = async (accountId: number): Promise<ApiResponse<BankAccount>> => {
  return apiGet<ApiResponse<BankAccount>>(`/users/bank-accounts/${accountId}`);
};

/**
 * Add new bank account
 */
export const addBankAccount = async (data: Omit<BankAccount, 'id' | 'isVerified' | 'createdDate'>): Promise<ApiResponse<BankAccount>> => {
  return apiPost<ApiResponse<BankAccount>>('/users/bank-accounts', data);
};

/**
 * Update bank account
 */
export const updateBankAccount = async (accountId: number, data: Partial<BankAccount>): Promise<ApiResponse<BankAccount>> => {
  return apiPut<ApiResponse<BankAccount>>(`/users/bank-accounts/${accountId}`, data);
};

/**
 * Delete bank account
 */
export const deleteBankAccount = async (accountId: number): Promise<ApiResponse> => {
  return apiDelete<ApiResponse>(`/users/bank-accounts/${accountId}`);
};

/**
 * Set primary bank account
 */
export const setPrimaryBankAccount = async (accountId: number): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/users/bank-accounts/${accountId}/set-primary`);
};

/**
 * Verify bank account
 */
export const verifyBankAccount = async (accountId: number, data: { amount1: number; amount2: number }): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/users/bank-accounts/${accountId}/verify`, data);
};

// ==================== Session Management APIs ====================

/**
 * Get active sessions
 */
export const getActiveSessions = async (): Promise<ApiResponse<Session[]>> => {
  return apiGet<ApiResponse<Session[]>>('/users/sessions');
};

/**
 * Terminate specific session
 */
export const terminateSession = async (sessionId: string): Promise<ApiResponse> => {
  return apiDelete<ApiResponse>(`/users/sessions/${sessionId}`);
};

/**
 * Terminate all other sessions
 */
export const terminateAllOtherSessions = async (): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/users/sessions/terminate-all');
};

// ==================== Login History APIs ====================

/**
 * Get login history
 */
export const getLoginHistory = async (params?: {
  page?: number;
  size?: number;
}): Promise<ApiResponse<{ content: LoginHistory[]; totalElements: number; totalPages: number }>> => {
  return apiGet<ApiResponse<{ content: LoginHistory[]; totalElements: number; totalPages: number }>>('/users/login-history', params);
};

// ==================== User Settings APIs ====================

/**
 * Get user preferences/settings
 */
export const getUserSettings = async (): Promise<ApiResponse<any>> => {
  return apiGet<ApiResponse<any>>('/users/settings');
};

/**
 * Update user settings
 */
export const updateUserSettings = async (settings: any): Promise<ApiResponse<any>> => {
  return apiPut<ApiResponse<any>>('/users/settings', settings);
};

/**
 * Update email notification settings
 */
export const updateEmailSettings = async (enabled: boolean): Promise<ApiResponse> => {
  return apiPut<ApiResponse>('/users/settings/email-notifications', { enabled });
};

/**
 * Update SMS notification settings
 */
export const updateSMSSettings = async (enabled: boolean): Promise<ApiResponse> => {
  return apiPut<ApiResponse>('/users/settings/sms-notifications', { enabled });
};

/**
 * Update push notification settings
 */
export const updatePushSettings = async (enabled: boolean): Promise<ApiResponse> => {
  return apiPut<ApiResponse>('/users/settings/push-notifications', { enabled });
};

// ==================== Transaction PIN APIs ====================

/**
 * Set transaction PIN
 */
export const setTransactionPIN = async (data: { pin: string; confirmPin: string; password: string }): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/users/transaction-pin/set', data);
};

/**
 * Change transaction PIN
 */
export const changeTransactionPIN = async (data: { oldPin: string; newPin: string; confirmPin: string }): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/users/transaction-pin/change', data);
};

/**
 * Reset transaction PIN
 */
export const resetTransactionPIN = async (data: { password: string; newPin: string; confirmPin: string }): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/users/transaction-pin/reset', data);
};

/**
 * Verify transaction PIN
 */
export const verifyTransactionPIN = async (pin: string): Promise<ApiResponse<{ valid: boolean }>> => {
  return apiPost<ApiResponse<{ valid: boolean }>>('/users/transaction-pin/verify', { pin });
};

// ==================== Account Management APIs ====================

/**
 * Request account deletion
 */
export const requestAccountDeletion = async (data: { reason: string; password: string }): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/users/account/delete-request', data);
};

/**
 * Cancel account deletion request
 */
export const cancelAccountDeletion = async (): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/users/account/cancel-deletion');
};

/**
 * Deactivate account
 */
export const deactivateAccount = async (data: { reason: string; password: string }): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/users/account/deactivate', data);
};

/**
 * Reactivate account
 */
export const reactivateAccount = async (): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/users/account/reactivate');
};

// ==================== Referral Link APIs ====================

/**
 * Get referral link
 */
export const getReferralLink = async (): Promise<ApiResponse<{ referralLink: string; referralCode: string }>> => {
  return apiGet<ApiResponse<{ referralLink: string; referralCode: string }>>('/users/referral-link');
};

/**
 * Generate new referral code
 */
export const generateReferralCode = async (): Promise<ApiResponse<{ referralCode: string }>> => {
  return apiPost<ApiResponse<{ referralCode: string }>>('/users/referral-link/generate');
};
