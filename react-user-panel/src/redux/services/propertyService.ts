import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Property, PropertyFilters } from '../../types/property.types';

// Base query with auth token
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Property API service
export const propertyService = createApi({
  reducerPath: 'propertyService',
  baseQuery,
  tagTypes: ['Property', 'Properties', 'Investment'],
  endpoints: (builder) => ({
    // Get all properties
    getProperties: builder.query<
      { data: Property[]; total: number; page: number; pageSize: number },
      { page?: number; pageSize?: number }
    >({
      query: ({ page = 1, pageSize = 12 }) => `/properties?page=${page}&pageSize=${pageSize}`,
      providesTags: ['Properties'],
    }),

    // Search properties with filters
    searchProperties: builder.mutation<
      { data: Property[]; total: number; page: number; pageSize: number },
      { filters?: PropertyFilters; page?: number; pageSize?: number; search?: string }
    >({
      query: (data) => {
        const { filters, page, pageSize, search } = data;
        return {
          url: '/properties/search',
          method: 'GET',
          params: {
            ...filters,
            search,
            page,
            size: pageSize,
          },
        };
      },
      invalidatesTags: ['Properties'],
    }),

    // Get property by ID
    getPropertyById: builder.query<{ data: Property }, string | number>({
      query: (id) => `/properties/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Property', id }],
    }),

    // Get featured properties
    getFeaturedProperties: builder.query<{ data: Property[] }, void>({
      query: () => '/properties/featured',
      providesTags: ['Properties'],
    }),

    // Get new launch properties
    getNewLaunchProperties: builder.query<{ data: Property[] }, void>({
      query: () => '/properties/new-launches',
      providesTags: ['Properties'],
    }),

    // Get trending properties
    getTrendingProperties: builder.query<{ data: Property[] }, void>({
      query: () => '/properties/trending',
      providesTags: ['Properties'],
    }),

    // Get property by category
    getPropertiesByCategory: builder.query<
      { data: Property[] },
      { category: string; limit?: number }
    >({
      query: ({ category, limit = 10 }) => `/properties/category/${category}?limit=${limit}`,
      providesTags: ['Properties'],
    }),

    // Get property by type
    getPropertiesByType: builder.query<
      { data: Property[] },
      { type: string; limit?: number }
    >({
      query: ({ type, limit = 10 }) => `/properties/type/${type}?limit=${limit}`,
      providesTags: ['Properties'],
    }),

    // Get property by city
    getPropertiesByCity: builder.query<
      { data: Property[] },
      { city: string; limit?: number }
    >({
      query: ({ city, limit = 10 }) => `/properties/city/${city}?limit=${limit}`,
      providesTags: ['Properties'],
    }),

    // Get similar properties
    getSimilarProperties: builder.query<{ data: Property[] }, string | number>({
      query: (propertyId) => `/properties/${propertyId}/similar`,
      providesTags: ['Properties'],
    }),

    // Get property documents
    getPropertyDocuments: builder.query<
      { data: any[] },
      string | number
    >({
      query: (propertyId) => `/properties/${propertyId}/documents`,
      providesTags: (_result, _error, id) => [{ type: 'Property', id }],
    }),

    // Get property investments
    getPropertyInvestments: builder.query<
      { data: any[]; total: number },
      { propertyId: string | number; page?: number; pageSize?: number }
    >({
      query: ({ propertyId, page = 1, pageSize = 10 }) =>
        `/properties/${propertyId}/investments?page=${page}&pageSize=${pageSize}`,
      providesTags: ['Investment'],
    }),

    // Add property to wishlist
    addToWishlist: builder.mutation<{ success: boolean; message: string }, string | number>({
      query: (propertyId) => ({
        url: `/properties/${propertyId}/wishlist`,
        method: 'POST',
      }),
      invalidatesTags: ['Property'],
    }),

    // Remove property from wishlist
    removeFromWishlist: builder.mutation<{ success: boolean; message: string }, string | number>({
      query: (propertyId) => ({
        url: `/properties/${propertyId}/wishlist`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Property'],
    }),

    // Get wishlist properties
    getWishlistProperties: builder.query<{ data: Property[] }, void>({
      query: () => '/properties/wishlist',
      providesTags: ['Properties'],
    }),

    // Track property view
    trackPropertyView: builder.mutation<{ success: boolean }, string | number>({
      query: (propertyId) => ({
        url: `/properties/${propertyId}/view`,
        method: 'POST',
      }),
    }),

    // Get property stats
    getPropertyStats: builder.query<
      { data: { totalProperties: number; totalInvestments: number; totalInvestors: number } },
      void
    >({
      query: () => '/properties/stats',
    }),

    // Get available cities
    getAvailableCities: builder.query<{ data: string[] }, void>({
      query: () => '/properties/filters/cities',
    }),

    // Get available property types
    getPropertyTypes: builder.query<{ data: string[] }, void>({
      query: () => '/properties/filters/types',
    }),

    // Get property amenities
    getPropertyAmenities: builder.query<{ data: string[] }, void>({
      query: () => '/properties/filters/amenities',
    }),

    // Calculate ROI
    calculateROI: builder.mutation<
      { data: { monthlyROI: number; annualROI: number; totalReturn: number } },
      { propertyId: string | number; investmentAmount: number; tenure: number }
    >({
      query: (data) => ({
        url: '/properties/calculate-roi',
        method: 'POST',
        body: data,
      }),
    }),

    // Get property price history
    getPriceHistory: builder.query<
      { data: Array<{ date: string; price: number }> },
      string | number
    >({
      query: (propertyId) => `/properties/${propertyId}/price-history`,
      providesTags: (_result, _error, id) => [{ type: 'Property', id }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetPropertiesQuery,
  useLazyGetPropertiesQuery,
  useSearchPropertiesMutation,
  useGetPropertyByIdQuery,
  useLazyGetPropertyByIdQuery,
  useGetFeaturedPropertiesQuery,
  useGetNewLaunchPropertiesQuery,
  useGetTrendingPropertiesQuery,
  useGetPropertiesByCategoryQuery,
  useLazyGetPropertiesByCategoryQuery,
  useGetPropertiesByTypeQuery,
  useLazyGetPropertiesByTypeQuery,
  useGetPropertiesByCityQuery,
  useLazyGetPropertiesByCityQuery,
  useGetSimilarPropertiesQuery,
  useLazyGetSimilarPropertiesQuery,
  useGetPropertyDocumentsQuery,
  useGetPropertyInvestmentsQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWishlistPropertiesQuery,
  useTrackPropertyViewMutation,
  useGetPropertyStatsQuery,
  useGetAvailableCitiesQuery,
  useGetPropertyTypesQuery,
  useGetPropertyAmenitiesQuery,
  useCalculateROIMutation,
  useGetPriceHistoryQuery,
} = propertyService;

export default propertyService;
