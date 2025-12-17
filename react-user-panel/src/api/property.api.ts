import { apiGet } from './config/axiosConfig';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  Property,
  PropertyFilters,
  PropertyType,
  PropertyStatus,
} from '@/types';

// ==================== Property Listing APIs ====================

/**
 * Get all properties with pagination and filters
 */
export const getProperties = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
} & Partial<PropertyFilters>): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>('/properties', params);
};

/**
 * Get featured properties
 */
export const getFeaturedProperties = async (params?: {
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>('/properties/featured', params);
};

/**
 * Get new launch properties
 */
export const getNewLaunchProperties = async (params?: {
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>('/properties/new-launches', params);
};

/**
 * Get trending/popular properties
 */
export const getTrendingProperties = async (params?: {
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>('/properties/trending', params);
};

/**
 * Get recommended properties for user
 */
export const getRecommendedProperties = async (params?: {
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>('/properties/recommended', params);
};

// ==================== Property Details APIs ====================

/**
 * Get property details by ID
 */
export const getPropertyById = async (propertyId: number): Promise<ApiResponse<Property>> => {
  return apiGet<ApiResponse<Property>>(`/properties/${propertyId}`);
};

/**
 * Get property details by property ID string
 */
export const getPropertyByPropertyId = async (propertyId: string): Promise<ApiResponse<Property>> => {
  return apiGet<ApiResponse<Property>>(`/properties/code/${propertyId}`);
};

/**
 * Get similar properties
 */
export const getSimilarProperties = async (
  propertyId: number,
  params?: { page?: number; size?: number }
): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>(`/properties/${propertyId}/similar`, params);
};

// ==================== Property Search & Filter APIs ====================

/**
 * Search properties
 */
export const searchProperties = async (params: {
  search: string;
  page?: number;
  size?: number;
} & Partial<PropertyFilters>): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>('/properties/search', params);
};

/**
 * Get properties by type
 */
export const getPropertiesByType = async (
  propertyType: PropertyType,
  params?: PaginationParams
): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>(`/properties/type/${propertyType}`, params);
};

/**
 * Get properties by status
 */
export const getPropertiesByStatus = async (
  status: PropertyStatus,
  params?: PaginationParams
): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>(`/properties/status/${status}`, params);
};

/**
 * Get properties by city
 */
export const getPropertiesByCity = async (
  city: string,
  params?: PaginationParams
): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>(`/properties/city/${city}`, params);
};

/**
 * Get properties by state
 */
export const getPropertiesByState = async (
  state: string,
  params?: PaginationParams
): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>(`/properties/state/${state}`, params);
};

/**
 * Get properties by price range
 */
export const getPropertiesByPriceRange = async (params: {
  minPrice: number;
  maxPrice: number;
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>('/properties/price-range', params);
};

/**
 * Get properties by investment range
 */
export const getPropertiesByInvestmentRange = async (params: {
  minInvestment: number;
  maxInvestment: number;
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>('/properties/investment-range', params);
};

// ==================== Property Filters & Facets APIs ====================

/**
 * Get available property types
 */
export const getPropertyTypes = async (): Promise<ApiResponse<{ type: PropertyType; count: number }[]>> => {
  return apiGet<ApiResponse<{ type: PropertyType; count: number }[]>>('/properties/filters/types');
};

/**
 * Get available cities
 */
export const getAvailableCities = async (): Promise<ApiResponse<{ city: string; state: string; count: number }[]>> => {
  return apiGet<ApiResponse<{ city: string; state: string; count: number }[]>>('/properties/filters/cities');
};

/**
 * Get available states
 */
export const getAvailableStates = async (): Promise<ApiResponse<{ state: string; count: number }[]>> => {
  return apiGet<ApiResponse<{ state: string; count: number }[]>>('/properties/filters/states');
};

/**
 * Get available amenities
 */
export const getAvailableAmenities = async (): Promise<ApiResponse<{ amenity: string; count: number }[]>> => {
  return apiGet<ApiResponse<{ amenity: string; count: number }[]>>('/properties/filters/amenities');
};

/**
 * Get price range statistics
 */
export const getPriceRangeStats = async (): Promise<ApiResponse<{
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}>> => {
  return apiGet<ApiResponse<{
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
  }>>('/properties/filters/price-range');
};

/**
 * Get investment range statistics
 */
export const getInvestmentRangeStats = async (): Promise<ApiResponse<{
  minInvestment: number;
  maxInvestment: number;
  avgInvestment: number;
}>> => {
  return apiGet<ApiResponse<{
    minInvestment: number;
    maxInvestment: number;
    avgInvestment: number;
  }>>('/properties/filters/investment-range');
};

// ==================== Property Statistics APIs ====================

/**
 * Get property statistics
 */
export const getPropertyStats = async (propertyId: number): Promise<ApiResponse<{
  totalInvestments: number;
  totalInvestorsCount: number;
  averageInvestment: number;
  bookingProgress: number;
  views: number;
  favorites: number;
}>> => {
  return apiGet<ApiResponse<{
    totalInvestments: number;
    totalInvestorsCount: number;
    averageInvestment: number;
    bookingProgress: number;
    views: number;
    favorites: number;
  }>>(`/properties/${propertyId}/stats`);
};

/**
 * Get recent investments for property
 */
export const getPropertyRecentInvestments = async (
  propertyId: number,
  params?: { page?: number; size?: number }
): Promise<PaginatedResponse<any>> => {
  return apiGet<PaginatedResponse<any>>(`/properties/${propertyId}/recent-investments`, params);
};

// ==================== Property Documents APIs ====================

/**
 * Get property documents
 */
export const getPropertyDocuments = async (propertyId: number): Promise<ApiResponse<any[]>> => {
  return apiGet<ApiResponse<any[]>>(`/properties/${propertyId}/documents`);
};

/**
 * Download property document
 */
export const downloadPropertyDocument = async (propertyId: number, documentId: number): Promise<Blob> => {
  const response = await fetch(`/api/properties/${propertyId}/documents/${documentId}/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

// ==================== Property Media APIs ====================

/**
 * Get property images
 */
export const getPropertyImages = async (propertyId: number): Promise<ApiResponse<string[]>> => {
  return apiGet<ApiResponse<string[]>>(`/properties/${propertyId}/images`);
};

/**
 * Get property videos
 */
export const getPropertyVideos = async (propertyId: number): Promise<ApiResponse<string[]>> => {
  return apiGet<ApiResponse<string[]>>(`/properties/${propertyId}/videos`);
};

// ==================== Property Favorites/Wishlist APIs ====================

/**
 * Get user's favorite properties
 */
export const getFavoriteProperties = async (params?: PaginationParams): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>('/properties/favorites', params);
};

/**
 * Add property to favorites
 */
export const addToFavorites = async (propertyId: number): Promise<ApiResponse> => {
  return apiGet<ApiResponse>(`/properties/${propertyId}/favorite/add`);
};

/**
 * Remove property from favorites
 */
export const removeFromFavorites = async (propertyId: number): Promise<ApiResponse> => {
  return apiGet<ApiResponse>(`/properties/${propertyId}/favorite/remove`);
};

/**
 * Check if property is in favorites
 */
export const isPropertyFavorite = async (propertyId: number): Promise<ApiResponse<{ isFavorite: boolean }>> => {
  return apiGet<ApiResponse<{ isFavorite: boolean }>>(`/properties/${propertyId}/favorite/check`);
};

// ==================== Property Comparison APIs ====================

/**
 * Compare properties
 */
export const compareProperties = async (propertyIds: number[]): Promise<ApiResponse<Property[]>> => {
  return apiGet<ApiResponse<Property[]>>('/properties/compare', { propertyIds: propertyIds.join(',') });
};

// ==================== Property Developer APIs ====================

/**
 * Get properties by developer
 */
export const getPropertiesByDeveloper = async (
  developerId: number,
  params?: PaginationParams
): Promise<PaginatedResponse<Property>> => {
  return apiGet<PaginatedResponse<Property>>(`/properties/developer/${developerId}`, params);
};

/**
 * Get developer details
 */
export const getDeveloperDetails = async (developerId: number): Promise<ApiResponse<any>> => {
  return apiGet<ApiResponse<any>>(`/properties/developers/${developerId}`);
};
