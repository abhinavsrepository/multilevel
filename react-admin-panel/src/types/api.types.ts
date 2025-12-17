// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  stats?: any;
  total?: number;
  token?: string;
  refreshToken?: string;
  user?: any;
  requires2FA?: boolean;
}

// Pagination
export interface PaginationParams {
  page: number;
  size: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Date Range
export interface DateRange {
  startDate: string;
  endDate: string;
}

// Filter params
export interface FilterParams extends PaginationParams {
  search?: string;
  status?: string;
  dateRange?: DateRange;
  [key: string]: any;
}
