import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  WalletBalance,
  Transaction,
  TransactionFilters,
  TransactionSummary,
  Withdrawal,
  WithdrawalRequest,
  WithdrawalRules,
  WalletType,
} from '../../types/wallet.types';
import { apiGet, apiPost } from '../../api/config/axiosConfig';

// State interface
interface WalletState {
  balance: WalletBalance | null;
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  selectedWalletType: WalletType;
  transactionFilters: TransactionFilters;
  transactionSummary: TransactionSummary | null;
  withdrawalRules: WithdrawalRules | null;
  totalTransactions: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  transactionsLoading: boolean;
  withdrawalsLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: WalletState = {
  balance: null,
  transactions: [],
  withdrawals: [],
  selectedWalletType: 'ALL',
  transactionFilters: {},
  transactionSummary: null,
  withdrawalRules: null,
  totalTransactions: 0,
  currentPage: 1,
  pageSize: 20,
  loading: false,
  transactionsLoading: false,
  withdrawalsLoading: false,
  error: null,
};

// Async thunks
export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: WalletBalance }>('/wallet/balance');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet balance');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (
    {
      filters,
      page = 1,
      pageSize = 20,
    }: {
      filters?: TransactionFilters;
      page?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiPost<{
        data: Transaction[];
        total: number;
        page: number;
        pageSize: number;
        summary: TransactionSummary;
      }>('/wallet/transactions', {
        filters,
        page,
        pageSize,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'wallet/fetchTransactionById',
  async (transactionId: string | number, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: Transaction }>(`/wallet/transactions/${transactionId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction details');
    }
  }
);

export const fetchWithdrawals = createAsyncThunk(
  'wallet/fetchWithdrawals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: Withdrawal[] }>('/wallet/withdrawals');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch withdrawals');
    }
  }
);

export const fetchWithdrawalRules = createAsyncThunk(
  'wallet/fetchWithdrawalRules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: WithdrawalRules }>('/wallet/withdrawal-rules');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch withdrawal rules');
    }
  }
);

export const requestWithdrawal = createAsyncThunk(
  'wallet/requestWithdrawal',
  async (withdrawalData: WithdrawalRequest, { rejectWithValue }) => {
    try {
      const response = await apiPost<{ data: Withdrawal }>('/wallet/withdraw', withdrawalData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request withdrawal');
    }
  }
);

export const cancelWithdrawal = createAsyncThunk(
  'wallet/cancelWithdrawal',
  async (withdrawalId: number, { rejectWithValue }) => {
    try {
      const response = await apiPost<{ data: Withdrawal }>(
        `/wallet/withdrawals/${withdrawalId}/cancel`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel withdrawal');
    }
  }
);

export const transferFunds = createAsyncThunk(
  'wallet/transferFunds',
  async (
    {
      fromWallet,
      toWallet,
      amount,
    }: {
      fromWallet: WalletType;
      toWallet: WalletType;
      amount: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiPost<{ data: { transaction: Transaction; balance: WalletBalance } }>(
        '/wallet/transfer',
        {
          fromWallet,
          toWallet,
          amount,
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to transfer funds');
    }
  }
);

// Wallet slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setSelectedWalletType: (state, action: PayloadAction<WalletType>) => {
      state.selectedWalletType = action.payload;
    },
    setTransactionFilters: (state, action: PayloadAction<TransactionFilters>) => {
      state.transactionFilters = { ...state.transactionFilters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    clearTransactionFilters: (state) => {
      state.transactionFilters = {};
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page when page size changes
    },
    updateBalance: (state, action: PayloadAction<Partial<WalletBalance>>) => {
      if (state.balance) {
        state.balance = { ...state.balance, ...action.payload };
      }
    },
    clearWalletError: (state) => {
      state.error = null;
    },
    resetWallet: (state) => {
      state.balance = null;
      state.transactions = [];
      state.withdrawals = [];
      state.selectedWalletType = 'ALL';
      state.transactionFilters = {};
      state.transactionSummary = null;
      state.totalTransactions = 0;
      state.currentPage = 1;
      state.loading = false;
      state.transactionsLoading = false;
      state.withdrawalsLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch wallet balance
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.transactionsLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        state.transactions = action.payload.data;
        state.totalTransactions = action.payload.total;
        state.currentPage = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.transactionSummary = action.payload.summary;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch withdrawals
    builder
      .addCase(fetchWithdrawals.pending, (state) => {
        state.withdrawalsLoading = true;
        state.error = null;
      })
      .addCase(fetchWithdrawals.fulfilled, (state, action) => {
        state.withdrawalsLoading = false;
        state.withdrawals = action.payload;
      })
      .addCase(fetchWithdrawals.rejected, (state, action) => {
        state.withdrawalsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch withdrawal rules
    builder
      .addCase(fetchWithdrawalRules.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWithdrawalRules.fulfilled, (state, action) => {
        state.loading = false;
        state.withdrawalRules = action.payload;
      })
      .addCase(fetchWithdrawalRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Request withdrawal
    builder
      .addCase(requestWithdrawal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestWithdrawal.fulfilled, (state, action) => {
        state.loading = false;
        state.withdrawals.unshift(action.payload);
      })
      .addCase(requestWithdrawal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Cancel withdrawal
    builder
      .addCase(cancelWithdrawal.fulfilled, (state, action) => {
        const index = state.withdrawals.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) {
          state.withdrawals[index] = action.payload;
        }
      });

    // Transfer funds
    builder
      .addCase(transferFunds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(transferFunds.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.transactions.unshift(action.payload.transaction);
      })
      .addCase(transferFunds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  setSelectedWalletType,
  setTransactionFilters,
  clearTransactionFilters,
  setCurrentPage,
  setPageSize,
  updateBalance,
  clearWalletError,
  resetWallet,
} = walletSlice.actions;

// Selectors
export const selectWalletBalance = (state: { wallet: WalletState }) => state.wallet.balance;
export const selectTransactions = (state: { wallet: WalletState }) => state.wallet.transactions;
export const selectWithdrawals = (state: { wallet: WalletState }) => state.wallet.withdrawals;
export const selectSelectedWalletType = (state: { wallet: WalletState }) =>
  state.wallet.selectedWalletType;
export const selectTransactionFilters = (state: { wallet: WalletState }) =>
  state.wallet.transactionFilters;
export const selectTransactionSummary = (state: { wallet: WalletState }) =>
  state.wallet.transactionSummary;
export const selectWithdrawalRules = (state: { wallet: WalletState }) => state.wallet.withdrawalRules;
export const selectTotalTransactions = (state: { wallet: WalletState }) =>
  state.wallet.totalTransactions;
export const selectCurrentPage = (state: { wallet: WalletState }) => state.wallet.currentPage;
export const selectPageSize = (state: { wallet: WalletState }) => state.wallet.pageSize;
export const selectTotalPages = (state: { wallet: WalletState }) =>
  Math.ceil(state.wallet.totalTransactions / state.wallet.pageSize);
export const selectWalletLoading = (state: { wallet: WalletState }) => state.wallet.loading;
export const selectTransactionsLoading = (state: { wallet: WalletState }) =>
  state.wallet.transactionsLoading;
export const selectWithdrawalsLoading = (state: { wallet: WalletState }) =>
  state.wallet.withdrawalsLoading;
export const selectWalletError = (state: { wallet: WalletState }) => state.wallet.error;

// Reducer
export default walletSlice.reducer;
