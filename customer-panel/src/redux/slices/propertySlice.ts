import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Property } from '@/types';

interface PropertyState {
  properties: Property[];
  selectedProperty: Property | null;
  comparisonList: Property[];
  loading: boolean;
  error: string | null;
}

const initialState: PropertyState = {
  properties: [],
  selectedProperty: null,
  comparisonList: [],
  loading: false,
  error: null,
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setProperties(state, action: PayloadAction<Property[]>) {
      state.properties = action.payload;
    },
    setSelectedProperty(state, action: PayloadAction<Property | null>) {
      state.selectedProperty = action.payload;
    },
    addToComparison(state, action: PayloadAction<Property>) {
      if (state.comparisonList.length < 4) {
        state.comparisonList.push(action.payload);
      }
    },
    removeFromComparison(state, action: PayloadAction<number>) {
      state.comparisonList = state.comparisonList.filter(p => p.id !== action.payload);
    },
    clearComparison(state) {
      state.comparisonList = [];
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setProperties,
  setSelectedProperty,
  addToComparison,
  removeFromComparison,
  clearComparison,
  setLoading,
  setError,
} = propertySlice.actions;

export default propertySlice.reducer;
