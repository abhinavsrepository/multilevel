import { apiGet, apiPost } from './config/axiosConfig';
import { ApiResponse, PaginatedResponse } from '@/types';

// ==================== Types ====================

export interface BuyerDetails {
  fullName: string;
  email?: string;
  mobile: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  userId?: number;
}

export interface ProclaimSaleData {
  propertyId: number;
  saleType: 'PRIMARY_BOOKING' | 'FULL_PAYMENT';
  plotSize: number;
  pricePerSqFt: number;
  paymentReceipt: string;
  buyerDetails: BuyerDetails;
  remarks?: string;
}

export interface ProjectedEarnings {
  saleAmount: number;
  downPayment: number;
  remainingAmount: number;
  directIncentive: {
    gross: number;
    tds: number;
    net: number;
    percentage: number;
  };
  tsbPool: {
    gross: number;
    tds: number;
    net: number;
    percentage: number;
    breakdown: {
      level1: { percent: number; amount: number; requiredDirects: number };
      level2: { percent: number; amount: number; requiredDirects: number };
      level3: { percent: number; amount: number; requiredDirects: number };
      level4to10: { percent: number; amount: number; requiredDirects: number; levels: number };
    };
  };
  totalEarnings: {
    gross: number;
    tds: number;
    net: number;
  };
  notes: {
    tdsRate: number;
    saleType: string;
    commissionBase: string;
  };
}

export interface PropertySale {
  id: number;
  saleId: string;
  propertyId: number;
  buyerUserId: number;
  employeeUserId: number;
  saleAmount: number;
  downPayment: number;
  saleType: 'PRIMARY_BOOKING' | 'FULL_PAYMENT';
  plotSize: number;
  pricePerSqFt: number;
  isSelfCode: boolean;
  saleStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  projectedDirectIncentive: number;
  projectedTSB: number;
  actualDirectIncentive?: number;
  actualTSB?: number;
  commissionActivated: boolean;
  paymentReceipt?: string;
  createdAt: string;
  updatedAt: string;
  property?: any;
  buyer?: any;
  employee?: any;
}

export interface SaleStats {
  totalSales: number;
  pendingSales: number;
  approvedSales: number;
  rejectedSales: number;
  totalSaleValue: number;
  totalCommissionEarned: number;
  thisMonthSales: number;
  successRate: string;
}

// ==================== API Functions ====================

/**
 * Proclaim a new property sale
 */
export const proclaimSale = async (data: ProclaimSaleData): Promise<ApiResponse<{
  sale: PropertySale;
  projections: {
    directIncentive: number;
    tsb: number;
    totalGross: number;
    saleAmount: number;
    downPayment: number;
  };
}>> => {
  return apiPost('/property-sales/proclaim', data);
};

/**
 * Calculate projected earnings for a potential sale
 */
export const calculateProjectedEarnings = async (params: {
  plotSize: number;
  pricePerSqFt: number;
  saleType: 'PRIMARY_BOOKING' | 'FULL_PAYMENT';
}): Promise<ApiResponse<ProjectedEarnings>> => {
  return apiPost('/property-sales/calculate-earnings', params);
};

/**
 * Get user's sale statistics
 */
export const getUserSaleStats = async (): Promise<ApiResponse<SaleStats>> => {
  return apiGet('/property-sales/stats');
};

/**
 * Get my proclaimed sales
 */
export const getMySales = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedResponse<PropertySale>> => {
  return apiGet('/property-sales/my-sales', params);
};

/**
 * Get sale details by ID
 */
export const getSaleDetails = async (saleId: number): Promise<ApiResponse<PropertySale>> => {
  return apiGet(`/property-sales/${saleId}`);
};
