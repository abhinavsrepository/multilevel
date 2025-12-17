import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import walletApi, { WalletBalance, WalletTransaction, WalletSummary, TransactionFilters } from '../../api/walletApi';

export interface WalletState {
  balance: WalletBalance | null;
  transactions: WalletTransaction[];
  summary: WalletSummary | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: null,
  transactions: [],
  summary: null,
  pagination: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchBalanceThunk = createAsyncThunk(
  'wallet/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletApi.getBalance();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet balance');
    }
  }
);

export const fetchTransactionsThunk = createAsyncThunk(
  'wallet/fetchTransactions',
  async (params: TransactionFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await walletApi.getTransactions(params);
      return {
        transactions: response.data,
        pagination: response.pagination,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchSummaryThunk = createAsyncThunk(
  'wallet/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletApi.getSummary();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet summary');
    }
  }
);

// Slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance: (state, action: PayloadAction<WalletBalance>) => {
      state.balance = action.payload;
    },
    setTransactions: (state, action: PayloadAction<WalletTransaction[]>) => {
      state.transactions = action.payload;
    },
    setSummary: (state, action: PayloadAction<WalletSummary>) => {
      state.summary = action.payload;
    },
    addTransaction: (state, action: PayloadAction<WalletTransaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<WalletTransaction>) => {
      const index = state.transactions.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearWalletData: (state) => {
      state.balance = null;
      state.transactions = [];
      state.summary = null;
      state.pagination = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Balance
    builder
      .addCase(fetchBalanceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBalanceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
        state.error = null;
      })
      .addCase(fetchBalanceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Transactions
    builder
      .addCase(fetchTransactionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination || null;
        state.error = null;
      })
      .addCase(fetchTransactionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Summary
    builder
      .addCase(fetchSummaryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSummaryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
        state.error = null;
      })
      .addCase(fetchSummaryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setBalance,
  setTransactions,
  setSummary,
  addTransaction,
  updateTransaction,
  setLoading,
  setError,
  clearWalletData,
} = walletSlice.actions;

export default walletSlice.reducer;
