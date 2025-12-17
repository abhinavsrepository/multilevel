import { apiGet, apiPost } from './config/axiosConfig';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  WalletBalance,
  Transaction,
  TransactionFilters,
  TransactionSummary,
  WalletType,
  TransactionType,
  TransactionCategory,
} from '@/types';

// ==================== Wallet Balance APIs ====================

/**
 * Get wallet balance
 */
export const getWalletBalance = async (): Promise<ApiResponse<WalletBalance>> => {
  return apiGet<ApiResponse<WalletBalance>>('/wallet/balance');
};

/**
 * Get specific wallet balance
 */
export const getSpecificWalletBalance = async (walletType: WalletType): Promise<ApiResponse<{ balance: number }>> => {
  return apiGet<ApiResponse<{ balance: number }>>(`/wallet/balance/${walletType.toLowerCase()}`);
};

/**
 * Refresh wallet balance
 */
export const refreshWalletBalance = async (): Promise<ApiResponse<WalletBalance>> => {
  return apiPost<ApiResponse<WalletBalance>>('/wallet/balance/refresh');
};

// ==================== Transaction History APIs ====================

/**
 * Get all transactions with pagination and filters
 */
export const getTransactions = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
} & Partial<TransactionFilters>): Promise<PaginatedResponse<Transaction>> => {
  return apiGet<PaginatedResponse<Transaction>>('/wallet/transactions', params);
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (transactionId: number): Promise<ApiResponse<Transaction>> => {
  return apiGet<ApiResponse<Transaction>>(`/wallet/transactions/${transactionId}`);
};

/**
 * Get transaction by transaction ID string
 */
export const getTransactionByTransactionId = async (transactionId: string): Promise<ApiResponse<Transaction>> => {
  return apiGet<ApiResponse<Transaction>>(`/wallet/transactions/code/${transactionId}`);
};

/**
 * Get transactions by wallet type
 */
export const getTransactionsByWallet = async (
  walletType: WalletType,
  params?: PaginationParams
): Promise<PaginatedResponse<Transaction>> => {
  return apiGet<PaginatedResponse<Transaction>>(`/wallet/transactions/wallet/${walletType.toLowerCase()}`, params);
};

/**
 * Get transactions by type (CREDIT/DEBIT)
 */
export const getTransactionsByType = async (
  type: TransactionType,
  params?: PaginationParams
): Promise<PaginatedResponse<Transaction>> => {
  return apiGet<PaginatedResponse<Transaction>>(`/wallet/transactions/type/${type.toLowerCase()}`, params);
};

/**
 * Get transactions by category
 */
export const getTransactionsByCategory = async (
  category: TransactionCategory,
  params?: PaginationParams
): Promise<PaginatedResponse<Transaction>> => {
  return apiGet<PaginatedResponse<Transaction>>(`/wallet/transactions/category/${category.toLowerCase()}`, params);
};

/**
 * Get credit transactions
 */
export const getCreditTransactions = async (params?: PaginationParams): Promise<PaginatedResponse<Transaction>> => {
  return apiGet<PaginatedResponse<Transaction>>('/wallet/transactions/credits', params);
};

/**
 * Get debit transactions
 */
export const getDebitTransactions = async (params?: PaginationParams): Promise<PaginatedResponse<Transaction>> => {
  return apiGet<PaginatedResponse<Transaction>>('/wallet/transactions/debits', params);
};

// ==================== Transaction Statistics APIs ====================

/**
 * Get transaction summary
 */
export const getTransactionSummary = async (params?: {
  startDate?: string;
  endDate?: string;
  walletType?: WalletType;
}): Promise<ApiResponse<TransactionSummary>> => {
  return apiGet<ApiResponse<TransactionSummary>>('/wallet/transactions/summary', params);
};

/**
 * Get monthly transaction summary
 */
export const getMonthlyTransactionSummary = async (params?: {
  year?: number;
  month?: number;
}): Promise<ApiResponse<{
  totalCredits: number;
  totalDebits: number;
  netChange: number;
  creditCount: number;
  debitCount: number;
  byCategory: {
    category: string;
    credits: number;
    debits: number;
  }[];
}>> => {
  return apiGet<ApiResponse<{
    totalCredits: number;
    totalDebits: number;
    netChange: number;
    creditCount: number;
    debitCount: number;
    byCategory: {
      category: string;
      credits: number;
      debits: number;
    }[];
  }>>('/wallet/transactions/summary/monthly', params);
};

/**
 * Get transaction trends
 */
export const getTransactionTrends = async (params?: {
  period?: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  walletType?: WalletType;
}): Promise<ApiResponse<{
  date: string;
  credits: number;
  debits: number;
  net: number;
}[]>> => {
  return apiGet<ApiResponse<{
    date: string;
    credits: number;
    debits: number;
    net: number;
  }[]>>('/wallet/transactions/trends', params);
};

// ==================== Add Money APIs ====================

/**
 * Add money to wallet
 */
export const addMoneyToWallet = async (data: {
  amount: number;
  walletType: 'INVESTMENT';
  paymentMethod: 'RAZORPAY' | 'UPI' | 'BANK_TRANSFER';
}): Promise<ApiResponse<{
  transactionId: string;
  paymentUrl?: string;
  orderId?: string;
  qrCode?: string;
}>> => {
  return apiPost<ApiResponse<{
    transactionId: string;
    paymentUrl?: string;
    orderId?: string;
    qrCode?: string;
  }>>('/wallet/add-money', data);
};

/**
 * Verify add money payment
 */
export const verifyAddMoneyPayment = async (data: {
  transactionId: string;
  paymentId: string;
  orderId: string;
  signature?: string;
}): Promise<ApiResponse<Transaction>> => {
  return apiPost<ApiResponse<Transaction>>('/wallet/add-money/verify', data);
};

/**
 * Get add money history
 */
export const getAddMoneyHistory = async (params?: PaginationParams): Promise<PaginatedResponse<Transaction>> => {
  return apiGet<PaginatedResponse<Transaction>>('/wallet/add-money/history', params);
};

// ==================== Transfer APIs ====================

/**
 * Transfer between wallets (internal transfer)
 */
export const transferBetweenWallets = async (data: {
  fromWallet: WalletType;
  toWallet: WalletType;
  amount: number;
  transactionPin: string;
}): Promise<ApiResponse<{
  fromTransaction: Transaction;
  toTransaction: Transaction;
}>> => {
  return apiPost<ApiResponse<{
    fromTransaction: Transaction;
    toTransaction: Transaction;
  }>>('/wallet/transfer', data);
};

/**
 * Check transfer eligibility
 */
export const checkTransferEligibility = async (data: {
  fromWallet: WalletType;
  toWallet: WalletType;
  amount: number;
}): Promise<ApiResponse<{
  eligible: boolean;
  reason?: string;
  charges?: number;
  netAmount?: number;
}>> => {
  return apiPost<ApiResponse<{
    eligible: boolean;
    reason?: string;
    charges?: number;
    netAmount?: number;
  }>>('/wallet/transfer/check-eligibility', data);
};

// ==================== Wallet Settings APIs ====================

/**
 * Get wallet settings
 */
export const getWalletSettings = async (): Promise<ApiResponse<{
  minWithdrawal: number;
  maxDailyWithdrawal: number;
  transferEnabled: boolean;
  addMoneyEnabled: boolean;
  commissionWalletTransferEnabled: boolean;
  tdsPercentage: number;
  tdsThreshold: number;
  adminChargePercentage: number;
}>> => {
  return apiGet<ApiResponse<{
    minWithdrawal: number;
    maxDailyWithdrawal: number;
    transferEnabled: boolean;
    addMoneyEnabled: boolean;
    commissionWalletTransferEnabled: boolean;
    tdsPercentage: number;
    tdsThreshold: number;
    adminChargePercentage: number;
  }>>('/wallet/settings');
};

// ==================== Wallet Limits APIs ====================

/**
 * Get wallet limits
 */
export const getWalletLimits = async (): Promise<ApiResponse<{
  dailyWithdrawalLimit: number;
  dailyWithdrawalUsed: number;
  dailyWithdrawalRemaining: number;
  monthlyWithdrawalLimit: number;
  monthlyWithdrawalUsed: number;
  monthlyWithdrawalRemaining: number;
  minWithdrawal: number;
  maxWithdrawal: number;
}>> => {
  return apiGet<ApiResponse<{
    dailyWithdrawalLimit: number;
    dailyWithdrawalUsed: number;
    dailyWithdrawalRemaining: number;
    monthlyWithdrawalLimit: number;
    monthlyWithdrawalUsed: number;
    monthlyWithdrawalRemaining: number;
    minWithdrawal: number;
    maxWithdrawal: number;
  }>>('/wallet/limits');
};

// ==================== Transaction Receipt APIs ====================

/**
 * Download transaction receipt
 */
export const downloadTransactionReceipt = async (transactionId: number): Promise<Blob> => {
  const response = await fetch(`/api/wallet/transactions/${transactionId}/receipt/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

/**
 * Email transaction receipt
 */
export const emailTransactionReceipt = async (transactionId: number, email?: string): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/wallet/transactions/${transactionId}/receipt/email`, { email });
};

// ==================== Wallet Statement APIs ====================

/**
 * Download wallet statement
 */
export const downloadWalletStatement = async (params: {
  startDate: string;
  endDate: string;
  walletType?: WalletType;
  format: 'PDF' | 'EXCEL' | 'CSV';
}): Promise<Blob> => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    format: params.format,
    ...(params.walletType && { walletType: params.walletType }),
  });

  const response = await fetch(`/api/wallet/statement/download?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

/**
 * Email wallet statement
 */
export const emailWalletStatement = async (params: {
  startDate: string;
  endDate: string;
  walletType?: WalletType;
  email?: string;
}): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/wallet/statement/email', params);
};

// ==================== Pending Transactions APIs ====================

/**
 * Get pending transactions
 */
export const getPendingTransactions = async (params?: PaginationParams): Promise<PaginatedResponse<Transaction>> => {
  return apiGet<PaginatedResponse<Transaction>>('/wallet/transactions/pending', params);
};

/**
 * Get failed transactions
 */
export const getFailedTransactions = async (params?: PaginationParams): Promise<PaginatedResponse<Transaction>> => {
  return apiGet<PaginatedResponse<Transaction>>('/wallet/transactions/failed', params);
};

/**
 * Retry failed transaction
 */
export const retryFailedTransaction = async (transactionId: number): Promise<ApiResponse<{
  transaction: Transaction;
  paymentUrl?: string;
  orderId?: string;
}>> => {
  return apiPost<ApiResponse<{
    transaction: Transaction;
    paymentUrl?: string;
    orderId?: string;
  }>>(`/wallet/transactions/${transactionId}/retry`);
};
