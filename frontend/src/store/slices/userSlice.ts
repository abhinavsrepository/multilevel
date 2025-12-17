import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import userApi, { UserProfile, DashboardData, TeamCount, UpdateProfileData } from '../../api/userApi';

export interface UserState {
  profile: UserProfile | null;
  dashboard: DashboardData | null;
  teamCount: TeamCount | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  dashboard: null,
  teamCount: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchProfileThunk = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  'user/updateProfile',
  async (data: UpdateProfileData, { rejectWithValue }) => {
    try {
      const response = await userApi.updateProfile(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchDashboardThunk = createAsyncThunk(
  'user/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getDashboard();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchTeamCountThunk = createAsyncThunk(
  'user/fetchTeamCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getTeamCount();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team count');
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    setDashboard: (state, action: PayloadAction<DashboardData>) => {
      state.dashboard = action.payload;
    },
    setTeamCount: (state, action: PayloadAction<TeamCount>) => {
      state.teamCount = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearUserData: (state) => {
      state.profile = null;
      state.dashboard = null;
      state.teamCount = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Dashboard
    builder
      .addCase(fetchDashboardThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Team Count
    builder
      .addCase(fetchTeamCountThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamCountThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.teamCount = action.payload;
        state.error = null;
      })
      .addCase(fetchTeamCountThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setProfile, setDashboard, setTeamCount, setLoading, setError, clearUserData } =
  userSlice.actions;
export default userSlice.reducer;
