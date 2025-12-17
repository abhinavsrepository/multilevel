import axiosInstance from './axiosConfig';

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'LAND';
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  pricing: {
    totalPrice: number;
    pricePerShare: number;
    totalShares: number;
    availableShares: number;
    minInvestment: number;
  };
  returns: {
    expectedReturn: number;
    returnPeriod: number;
    returnType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  };
  status: 'ACTIVE' | 'COMING_SOON' | 'FULLY_FUNDED' | 'COMPLETED';
  images: string[];
  documents: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  features: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  propertyType?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PropertySearchQuery {
  q: string;
  propertyType?: string;
  city?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const propertyApi = {
  /**
   * Get all properties with optional filters
   */
  getAllProperties: async (params?: PropertyFilters): Promise<ApiResponse<Property[]>> => {
    const response = await axiosInstance.get<ApiResponse<Property[]>>('/properties', { params });
    return response.data;
  },

  /**
   * Get property by ID
   */
  getPropertyById: async (id: string): Promise<ApiResponse<Property>> => {
    const response = await axiosInstance.get<ApiResponse<Property>>(`/properties/${id}`);
    return response.data;
  },

  /**
   * Get featured properties
   */
  getFeaturedProperties: async (): Promise<ApiResponse<Property[]>> => {
    const response = await axiosInstance.get<ApiResponse<Property[]>>('/properties/featured');
    return response.data;
  },

  /**
   * Search properties
   */
  searchProperties: async (query: PropertySearchQuery): Promise<ApiResponse<Property[]>> => {
    const response = await axiosInstance.get<ApiResponse<Property[]>>('/properties/search', {
      params: query,
    });
    return response.data;
  },
};

export default propertyApi;
