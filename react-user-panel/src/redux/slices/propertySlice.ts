import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Property, PropertyFilters } from '../../types/property.types';
import { apiGet, apiPost } from '../../api/config/axiosConfig';

// State interface
interface PropertyState {
  properties: Property[];
  selectedProperty: Property | null;
  filters: PropertyFilters;
  totalProperties: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  selectedPropertyLoading: boolean;
  error: string | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  sortBy: PropertyFilters['sortBy'];
}

// Initial state
const initialState: PropertyState = {
  properties: [],
  selectedProperty: null,
  filters: {
    sortBy: 'LATEST',
  },
  totalProperties: 0,
  currentPage: 1,
  pageSize: 12,
  loading: false,
  selectedPropertyLoading: false,
  error: null,
  searchQuery: '',
  viewMode: 'grid',
  sortBy: 'LATEST',
};

// Async thunks
export const fetchProperties = createAsyncThunk(
  'property/fetchProperties',
  async (
    {
      filters,
      page = 1,
      pageSize = 12,
    }: {
      filters?: PropertyFilters;
      page?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiPost<{
        data: Property[];
        total: number;
        page: number;
        pageSize: number;
      }>('/property/search', {
        filters,
        page,
        pageSize,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'property/fetchPropertyById',
  async (propertyId: string | number, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: Property }>(`/property/${propertyId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property details');
    }
  }
);

export const fetchFeaturedProperties = createAsyncThunk(
  'property/fetchFeaturedProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: Property[] }>('/property/featured');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured properties');
    }
  }
);

export const fetchNewLaunchProperties = createAsyncThunk(
  'property/fetchNewLaunchProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: Property[] }>('/property/new-launch');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch new launch properties');
    }
  }
);

export const searchProperties = createAsyncThunk(
  'property/searchProperties',
  async (
    {
      query,
      page = 1,
      pageSize = 12,
    }: {
      query: string;
      page?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiGet<{
        data: Property[];
        total: number;
        page: number;
        pageSize: number;
      }>(`/property/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search properties');
    }
  }
);

// Property slice
const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<PropertyFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = { sortBy: 'LATEST' };
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page when search changes
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
      state.currentPage = 1;
    },
    setSelectedProperty: (state, action: PayloadAction<Property | null>) => {
      state.selectedProperty = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page when page size changes
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setSortBy: (state, action: PayloadAction<PropertyFilters['sortBy']>) => {
      state.sortBy = action.payload;
      state.filters.sortBy = action.payload;
      state.currentPage = 1; // Reset to first page when sort changes
    },
    clearPropertyError: (state) => {
      state.error = null;
    },
    resetPropertyState: (state) => {
      state.properties = [];
      state.selectedProperty = null;
      state.filters = { sortBy: 'LATEST' };
      state.totalProperties = 0;
      state.currentPage = 1;
      state.loading = false;
      state.error = null;
      state.searchQuery = '';
    },
  },
  extraReducers: (builder) => {
    // Fetch properties
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.data;
        state.totalProperties = action.payload.total;
        state.currentPage = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch property by ID
    builder
      .addCase(fetchPropertyById.pending, (state) => {
        state.selectedPropertyLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.selectedPropertyLoading = false;
        state.selectedProperty = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.selectedPropertyLoading = false;
        state.error = action.payload as string;
      });

    // Fetch featured properties
    builder
      .addCase(fetchFeaturedProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(fetchFeaturedProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch new launch properties
    builder
      .addCase(fetchNewLaunchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewLaunchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(fetchNewLaunchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Search properties
    builder
      .addCase(searchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.data;
        state.totalProperties = action.payload.total;
        state.currentPage = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(searchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  setFilters,
  clearFilters,
  setSearchQuery,
  clearSearchQuery,
  setSelectedProperty,
  setCurrentPage,
  setPageSize,
  setViewMode,
  setSortBy,
  clearPropertyError,
  resetPropertyState,
} = propertySlice.actions;

// Selectors
export const selectProperties = (state: { property: PropertyState }) => state.property.properties;
export const selectSelectedProperty = (state: { property: PropertyState }) =>
  state.property.selectedProperty;
export const selectPropertyFilters = (state: { property: PropertyState }) => state.property.filters;
export const selectSearchQuery = (state: { property: PropertyState }) => state.property.searchQuery;
export const selectViewMode = (state: { property: PropertyState }) => state.property.viewMode;
export const selectSortBy = (state: { property: PropertyState }) => state.property.sortBy;
export const selectCurrentPage = (state: { property: PropertyState }) => state.property.currentPage;
export const selectPageSize = (state: { property: PropertyState }) => state.property.pageSize;
export const selectTotalProperties = (state: { property: PropertyState }) =>
  state.property.totalProperties;
export const selectTotalPages = (state: { property: PropertyState }) =>
  Math.ceil(state.property.totalProperties / state.property.pageSize);
export const selectPropertyLoading = (state: { property: PropertyState }) => state.property.loading;
export const selectSelectedPropertyLoading = (state: { property: PropertyState }) =>
  state.property.selectedPropertyLoading;
export const selectPropertyError = (state: { property: PropertyState }) => state.property.error;

// Reducer
export default propertySlice.reducer;
