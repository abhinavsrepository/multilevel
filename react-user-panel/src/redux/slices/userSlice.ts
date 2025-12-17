import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserStats, RankProgress, KYCDocument, BankAccount } from '../../types/user.types';
import { apiGet, apiPost, apiPut } from '../../api/config/axiosConfig';

// State interface
interface UserState {
  profile: User | null;
  stats: UserStats | null;
  rankProgress: RankProgress | null;
  kycDocuments: KYCDocument[];
  bankAccounts: BankAccount[];
  loading: boolean;
  statsLoading: boolean;
  rankProgressLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserState = {
  profile: null,
  stats: null,
  rankProgress: null,
  kycDocuments: [],
  bankAccounts: [],
  loading: false,
  statsLoading: false,
  rankProgressLoading: false,
  error: null,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: User }>('/user/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await apiPut<{ data: User }>('/user/profile', profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'user/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: UserStats }>('/user/stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const fetchRankProgress = createAsyncThunk(
  'user/fetchRankProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: RankProgress }>('/user/rank-progress');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rank progress');
    }
  }
);

export const fetchKYCDocuments = createAsyncThunk(
  'user/fetchKYCDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: KYCDocument[] }>('/user/kyc/documents');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC documents');
    }
  }
);

export const uploadKYCDocument = createAsyncThunk(
  'user/uploadKYCDocument',
  async (
    { documentType, formData }: { documentType: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiPost<{ data: KYCDocument }>(
        `/user/kyc/upload/${documentType}`,
        formData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

export const fetchBankAccounts = createAsyncThunk(
  'user/fetchBankAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: BankAccount[] }>('/user/bank-accounts');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bank accounts');
    }
  }
);

export const addBankAccount = createAsyncThunk(
  'user/addBankAccount',
  async (bankData: Partial<BankAccount>, { rejectWithValue }) => {
    try {
      const response = await apiPost<{ data: BankAccount }>('/user/bank-accounts', bankData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add bank account');
    }
  }
);

export const updateBankAccount = createAsyncThunk(
  'user/updateBankAccount',
  async ({ id, bankData }: { id: number; bankData: Partial<BankAccount> }, { rejectWithValue }) => {
    try {
      const response = await apiPut<{ data: BankAccount }>(`/user/bank-accounts/${id}`, bankData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update bank account');
    }
  }
);

export const setPrimaryBankAccount = createAsyncThunk(
  'user/setPrimaryBankAccount',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiPost<{ data: BankAccount[] }>(
        `/user/bank-accounts/${id}/set-primary`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set primary account');
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    updateStats: (state, action: PayloadAction<Partial<UserStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },
    clearUserError: (state) => {
      state.error = null;
    },
    resetUser: (state) => {
      state.profile = null;
      state.stats = null;
      state.rankProgress = null;
      state.kycDocuments = [];
      state.bankAccounts = [];
      state.loading = false;
      state.statsLoading = false;
      state.rankProgressLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch rank progress
    builder
      .addCase(fetchRankProgress.pending, (state) => {
        state.rankProgressLoading = true;
        state.error = null;
      })
      .addCase(fetchRankProgress.fulfilled, (state, action) => {
        state.rankProgressLoading = false;
        state.rankProgress = action.payload;
      })
      .addCase(fetchRankProgress.rejected, (state, action) => {
        state.rankProgressLoading = false;
        state.error = action.payload as string;
      });

    // Fetch KYC documents
    builder
      .addCase(fetchKYCDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchKYCDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.kycDocuments = action.payload;
      })
      .addCase(fetchKYCDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Upload KYC document
    builder
      .addCase(uploadKYCDocument.fulfilled, (state, action) => {
        const index = state.kycDocuments.findIndex(
          (doc) => doc.documentType === action.payload.documentType
        );
        if (index !== -1) {
          state.kycDocuments[index] = action.payload;
        } else {
          state.kycDocuments.push(action.payload);
        }
      });

    // Fetch bank accounts
    builder
      .addCase(fetchBankAccounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBankAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.bankAccounts = action.payload;
      })
      .addCase(fetchBankAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add bank account
    builder
      .addCase(addBankAccount.fulfilled, (state, action) => {
        state.bankAccounts.push(action.payload);
      });

    // Update bank account
    builder
      .addCase(updateBankAccount.fulfilled, (state, action) => {
        const index = state.bankAccounts.findIndex((acc) => acc.id === action.payload.id);
        if (index !== -1) {
          state.bankAccounts[index] = action.payload;
        }
      });

    // Set primary bank account
    builder
      .addCase(setPrimaryBankAccount.fulfilled, (state, action) => {
        state.bankAccounts = action.payload;
      });
  },
});

// Actions
export const { updateProfile, updateStats, clearUserError, resetUser } = userSlice.actions;

// Selectors
export const selectUserProfile = (state: { user: UserState }) => state.user.profile;
export const selectUserStats = (state: { user: UserState }) => state.user.stats;
export const selectRankProgress = (state: { user: UserState }) => state.user.rankProgress;
export const selectKYCDocuments = (state: { user: UserState }) => state.user.kycDocuments;
export const selectBankAccounts = (state: { user: UserState }) => state.user.bankAccounts;
export const selectPrimaryBankAccount = (state: { user: UserState }) =>
  state.user.bankAccounts.find((acc) => acc.isPrimary);
export const selectUserLoading = (state: { user: UserState }) => state.user.loading;
export const selectStatsLoading = (state: { user: UserState }) => state.user.statsLoading;
export const selectRankProgressLoading = (state: { user: UserState }) =>
  state.user.rankProgressLoading;
export const selectUserError = (state: { user: UserState }) => state.user.error;

// Reducer
export default userSlice.reducer;
