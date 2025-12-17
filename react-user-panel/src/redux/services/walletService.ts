import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  WalletBalance,
  Transaction,
  TransactionFilters,
  TransactionSummary,
  Withdrawal,
  WithdrawalRequest,
  WithdrawalRules,
} from '../../types/wallet.types';

// Base query with auth token
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Wallet API service
export const walletService = createApi({
  reducerPath: 'walletService',
  baseQuery,
  tagTypes: ['Wallet', 'Transaction', 'Withdrawal'],
  endpoints: (builder) => ({
    // Get wallet balance
    getWalletBalance: builder.query<{ data: WalletBalance }, void>({
      query: () => '/wallet/balance',
      providesTags: ['Wallet'],
    }),

    // Get wallet balance by type
    getWalletBalanceByType: builder.query<{ data: { balance: number } }, string>({
      query: (walletType) => `/wallet/balance/${walletType}`,
      providesTags: ['Wallet'],
    }),

    // Get transactions
    getTransactions: builder.mutation<
      {
        data: Transaction[];
        total: number;
        page: number;
        pageSize: number;
        summary: TransactionSummary;
      },
      { filters?: TransactionFilters; page?: number; pageSize?: number }
    >({
      query: (data) => ({
        url: '/wallet/transactions',
        method: 'POST',
        body: data,
      }),
    }),

    // Get transaction by ID
    getTransactionById: builder.query<{ data: Transaction }, string | number>({
      query: (id) => `/wallet/transactions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transaction', id }],
    }),

    // Get recent transactions
    getRecentTransactions: builder.query<{ data: Transaction[] }, { limit?: number }>({
      query: ({ limit = 10 }) => `/wallet/transactions/recent?limit=${limit}`,
      providesTags: ['Transaction'],
    }),

    // Get transaction summary
    getTransactionSummary: builder.query<
      { data: TransactionSummary },
      { startDate?: string; endDate?: string }
    >({
      query: ({ startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/wallet/transactions/summary?${params.toString()}`;
      },
      providesTags: ['Transaction'],
    }),

    // Get withdrawals
    getWithdrawals: builder.query<{ data: Withdrawal[] }, void>({
      query: () => '/wallet/withdrawals',
      providesTags: ['Withdrawal'],
    }),

    // Get withdrawal by ID
    getWithdrawalById: builder.query<{ data: Withdrawal }, string | number>({
      query: (id) => `/wallet/withdrawals/${id}`,
      providesTags: (result, error, id) => [{ type: 'Withdrawal', id }],
    }),

    // Get withdrawal rules
    getWithdrawalRules: builder.query<{ data: WithdrawalRules }, void>({
      query: () => '/wallet/withdrawal-rules',
    }),

    // Request withdrawal
    requestWithdrawal: builder.mutation<{ data: Withdrawal }, WithdrawalRequest>({
      query: (data) => ({
        url: '/wallet/withdraw',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet', 'Withdrawal'],
    }),

    // Cancel withdrawal
    cancelWithdrawal: builder.mutation<{ data: Withdrawal }, string | number>({
      query: (withdrawalId) => ({
        url: `/wallet/withdrawals/${withdrawalId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Wallet', 'Withdrawal'],
    }),

    // Transfer funds between wallets
    transferFunds: builder.mutation<
      { data: { transaction: Transaction; balance: WalletBalance } },
      { fromWallet: string; toWallet: string; amount: number; transactionPin?: string }
    >({
      query: (data) => ({
        url: '/wallet/transfer',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet', 'Transaction'],
    }),

    // Verify transaction PIN
    verifyTransactionPin: builder.mutation<{ success: boolean }, { pin: string }>({
      query: (data) => ({
        url: '/wallet/verify-pin',
        method: 'POST',
        body: data,
      }),
    }),

    // Set transaction PIN
    setTransactionPin: builder.mutation<
      { success: boolean; message: string },
      { pin: string; confirmPin: string; password: string }
    >({
      query: (data) => ({
        url: '/wallet/set-pin',
        method: 'POST',
        body: data,
      }),
    }),

    // Change transaction PIN
    changeTransactionPin: builder.mutation<
      { success: boolean; message: string },
      { oldPin: string; newPin: string; confirmPin: string }
    >({
      query: (data) => ({
        url: '/wallet/change-pin',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset transaction PIN
    resetTransactionPin: builder.mutation<
      { success: boolean; message: string },
      { password: string }
    >({
      query: (data) => ({
        url: '/wallet/reset-pin',
        method: 'POST',
        body: data,
      }),
    }),

    // Get wallet statistics
    getWalletStats: builder.query<
      {
        data: {
          totalEarnings: number;
          totalWithdrawals: number;
          pendingWithdrawals: number;
          totalTransactions: number;
          monthlyEarnings: number;
          monthlyWithdrawals: number;
        };
      },
      void
    >({
      query: () => '/wallet/stats',
      providesTags: ['Wallet'],
    }),

    // Get wallet activity graph data
    getWalletActivity: builder.query<
      { data: Array<{ date: string; credits: number; debits: number }> },
      { period: 'week' | 'month' | 'year' }
    >({
      query: ({ period }) => `/wallet/activity?period=${period}`,
      providesTags: ['Wallet'],
    }),

    // Export transactions
    exportTransactions: builder.mutation<
      { data: { downloadUrl: string } },
      { filters?: TransactionFilters; format: 'pdf' | 'excel' | 'csv' }
    >({
      query: (data) => ({
        url: '/wallet/transactions/export',
        method: 'POST',
        body: data,
      }),
    }),

    // Get transaction receipt
    getTransactionReceipt: builder.query<{ data: { receiptUrl: string } }, string | number>({
      query: (transactionId) => `/wallet/transactions/${transactionId}/receipt`,
    }),

    // Download withdrawal receipt
    getWithdrawalReceipt: builder.query<{ data: { receiptUrl: string } }, string | number>({
      query: (withdrawalId) => `/wallet/withdrawals/${withdrawalId}/receipt`,
    }),

    // Get available balance for withdrawal
    getAvailableBalance: builder.query<{ data: { availableBalance: number } }, void>({
      query: () => '/wallet/available-balance',
      providesTags: ['Wallet'],
    }),

    // Calculate withdrawal amount
    calculateWithdrawal: builder.mutation<
      {
        data: {
          requestedAmount: number;
          tds: number;
          adminCharge: number;
          netAmount: number;
        };
      },
      { amount: number }
    >({
      query: (data) => ({
        url: '/wallet/calculate-withdrawal',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetWalletBalanceQuery,
  useGetWalletBalanceByTypeQuery,
  useGetTransactionsMutation,
  useGetTransactionByIdQuery,
  useGetRecentTransactionsQuery,
  useGetTransactionSummaryQuery,
  useGetWithdrawalsQuery,
  useGetWithdrawalByIdQuery,
  useGetWithdrawalRulesQuery,
  useRequestWithdrawalMutation,
  useCancelWithdrawalMutation,
  useTransferFundsMutation,
  useVerifyTransactionPinMutation,
  useSetTransactionPinMutation,
  useChangeTransactionPinMutation,
  useResetTransactionPinMutation,
  useGetWalletStatsQuery,
  useGetWalletActivityQuery,
  useExportTransactionsMutation,
  useGetTransactionReceiptQuery,
  useLazyGetTransactionReceiptQuery,
  useGetWithdrawalReceiptQuery,
  useLazyGetWithdrawalReceiptQuery,
  useGetAvailableBalanceQuery,
  useCalculateWithdrawalMutation,
} = walletService;

export default walletService;
