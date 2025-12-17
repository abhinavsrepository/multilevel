// Common types used across the application
export type { ApiResponse, PaginatedResponse, FilterParams } from './api.types';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
  search?: string;
  searchBy?: string;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export type FilterOptions = PaginationParams & SortParams & SearchParams & DateRangeParams;
