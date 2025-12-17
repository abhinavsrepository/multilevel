import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SiteVisit } from '@/types';

interface SiteVisitState {
  visits: SiteVisit[];
  loading: boolean;
  error: string | null;
}

const initialState: SiteVisitState = {
  visits: [],
  loading: false,
  error: null,
};

const siteVisitSlice = createSlice({
  name: 'siteVisit',
  initialState,
  reducers: {
    setVisits(state, action: PayloadAction<SiteVisit[]>) {
      state.visits = action.payload;
    },
    addVisit(state, action: PayloadAction<SiteVisit>) {
      state.visits.unshift(action.payload);
    },
    updateVisit(state, action: PayloadAction<SiteVisit>) {
      const index = state.visits.findIndex(v => v.id === action.payload.id);
      if (index !== -1) {
        state.visits[index] = action.payload;
      }
    },
    removeVisit(state, action: PayloadAction<number>) {
      state.visits = state.visits.filter(v => v.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setVisits, addVisit, updateVisit, removeVisit, setLoading, setError } = siteVisitSlice.actions;
export default siteVisitSlice.reducer;
