import api from './axiosConfig';
import type { Property, PropertyFilter, PaginatedResponse, PaginationParams } from '@/types';

export const propertyApi = {
  getAll: (params?: PaginationParams & PropertyFilter) =>
    api.get<PaginatedResponse<Property>>('/properties', { params }),

  getById: (id: number) => api.get<Property>(`/properties/${id}`),

  getFeatured: () => api.get<Property[]>('/properties/featured'),

  getTrending: () => api.get<Property[]>('/properties/trending'),

  search: (query: string, filters?: PropertyFilter) =>
    api.get<Property[]>('/properties/search', { params: { q: query, ...filters } }),

  getByCity: (city: string) => api.get<Property[]>(`/properties/city/${city}`),

  getByType: (type: string) => api.get<Property[]>(`/properties/type/${type}`),

  getPriceRange: (min: number, max: number) =>
    api.get<Property[]>('/properties/price-range', { params: { min, max } }),

  getSimilar: (id: number) => api.get<Property[]>(`/properties/${id}/similar`),

  getStats: (id: number) => api.get(`/properties/${id}/stats`),
};
