import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import propertyApi, { Property, PropertyFilters } from '../../api/propertyApi';

export interface PropertyFiltersState {
  propertyType?: string;
  city?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  status?: string;
}

export interface PropertyState {
  properties: Property[];
  selectedProperty: Property | null;
  featuredProperties: Property[];
  filters: PropertyFiltersState;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: PropertyState = {
  properties: [],
  selectedProperty: null,
  featuredProperties: [],
  filters: {},
  pagination: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchPropertiesThunk = createAsyncThunk(
  'property/fetchProperties',
  async (params: PropertyFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await propertyApi.getAllProperties(params);
      return {
        properties: response.data,
        pagination: response.pagination,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

export const fetchPropertyByIdThunk = createAsyncThunk(
  'property/fetchPropertyById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await propertyApi.getPropertyById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property details');
    }
  }
);

export const fetchFeaturedPropertiesThunk = createAsyncThunk(
  'property/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertyApi.getFeaturedProperties();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured properties');
    }
  }
);

export const searchPropertiesThunk = createAsyncThunk(
  'property/searchProperties',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await propertyApi.searchProperties({ q: query });
      return {
        properties: response.data,
        pagination: response.pagination,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search properties');
    }
  }
);

// Slice
const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setProperties: (state, action: PayloadAction<Property[]>) => {
      state.properties = action.payload;
    },
    setSelectedProperty: (state, action: PayloadAction<Property | null>) => {
      state.selectedProperty = action.payload;
    },
    setFeaturedProperties: (state, action: PayloadAction<Property[]>) => {
      state.featuredProperties = action.payload;
    },
    setFilters: (state, action: PayloadAction<PropertyFiltersState>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<PropertyFiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Properties
    builder
      .addCase(fetchPropertiesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertiesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.properties;
        state.pagination = action.payload.pagination || null;
        state.error = null;
      })
      .addCase(fetchPropertiesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Property by ID
    builder
      .addCase(fetchPropertyByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProperty = action.payload;
        state.error = null;
      })
      .addCase(fetchPropertyByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Featured Properties
    builder
      .addCase(fetchFeaturedPropertiesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedPropertiesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProperties = action.payload;
        state.error = null;
      })
      .addCase(fetchFeaturedPropertiesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Search Properties
    builder
      .addCase(searchPropertiesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPropertiesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.properties;
        state.pagination = action.payload.pagination || null;
        state.error = null;
      })
      .addCase(searchPropertiesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setProperties,
  setSelectedProperty,
  setFeaturedProperties,
  setFilters,
  updateFilters,
  clearFilters,
  setLoading,
  setError,
} = propertySlice.actions;

export default propertySlice.reducer;
