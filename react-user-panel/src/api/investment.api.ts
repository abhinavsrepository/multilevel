import { apiGet, apiPost, apiPut, apiDelete } from './config/axiosConfig';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  Investment,
  InvestmentRequest,
  InvestmentStatus,
  Portfolio,
  Installment,
} from '@/types';

// ==================== Investment Creation APIs ====================

/**
 * Create new investment
 */
export const createInvestment = async (data: InvestmentRequest): Promise<ApiResponse<{
  investment: Investment;
  paymentUrl?: string;
  orderId?: string;
}>> => {
  return apiPost<ApiResponse<{
    investment: Investment;
    paymentUrl?: string;
    orderId?: string;
  }>>('/investments', data);
};

/**
 * Calculate investment details
 */
export const calculateInvestment = async (data: {
  propertyId: number;
  investmentAmount: number;
  investmentType: 'FULL_PAYMENT' | 'INSTALLMENT';
  installmentPlan?: {
    planType: 'MONTHLY' | 'QUARTERLY' | 'CUSTOM';
    downPayment: number;
    totalInstallments: number;
  };
}): Promise<ApiResponse<{
  investmentAmount: number;
  bvAllocated: number;
  commissions: any;
  installmentDetails?: any;
}>> => {
  return apiPost<ApiResponse<{
    investmentAmount: number;
    bvAllocated: number;
    commissions: any;
    installmentDetails?: any;
  }>>('/investments/calculate', data);
};

/**
 * Verify payment for investment
 */
export const verifyInvestmentPayment = async (data: {
  investmentId: number;
  paymentId: string;
  orderId: string;
  signature?: string;
}): Promise<ApiResponse<Investment>> => {
  return apiPost<ApiResponse<Investment>>('/investments/verify-payment', data);
};

// ==================== Investment List APIs ====================

/**
 * Get all user investments with pagination and filters
 */
export const getInvestments = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: InvestmentStatus;
  propertyId?: number;
  search?: string;
}): Promise<PaginatedResponse<Investment>> => {
  return apiGet<PaginatedResponse<Investment>>('/investments', params);
};

/**
 * Get active investments
 */
export const getActiveInvestments = async (params?: PaginationParams): Promise<PaginatedResponse<Investment>> => {
  return apiGet<PaginatedResponse<Investment>>('/investments/active', params);
};

/**
 * Get completed investments
 */
export const getCompletedInvestments = async (params?: PaginationParams): Promise<PaginatedResponse<Investment>> => {
  return apiGet<PaginatedResponse<Investment>>('/investments/completed', params);
};

/**
 * Get matured investments
 */
export const getMaturedInvestments = async (params?: PaginationParams): Promise<PaginatedResponse<Investment>> => {
  return apiGet<PaginatedResponse<Investment>>('/investments/matured', params);
};

/**
 * Get pending investments
 */
export const getPendingInvestments = async (params?: PaginationParams): Promise<PaginatedResponse<Investment>> => {
  return apiGet<PaginatedResponse<Investment>>('/investments/pending', params);
};

// ==================== Investment Details APIs ====================

/**
 * Get investment details by ID
 */
export const getInvestmentById = async (investmentId: number): Promise<ApiResponse<Investment>> => {
  return apiGet<ApiResponse<Investment>>(`/investments/${investmentId}`);
};

/**
 * Get investment details by investment ID string
 */
export const getInvestmentByInvestmentId = async (investmentId: string): Promise<ApiResponse<Investment>> => {
  return apiGet<ApiResponse<Investment>>(`/investments/code/${investmentId}`);
};

/**
 * Get investment documents
 */
export const getInvestmentDocuments = async (investmentId: number): Promise<ApiResponse<any[]>> => {
  return apiGet<ApiResponse<any[]>>(`/investments/${investmentId}/documents`);
};

/**
 * Download investment document
 */
export const downloadInvestmentDocument = async (investmentId: number, documentId: number): Promise<Blob> => {
  const response = await fetch(`/api/investments/${investmentId}/documents/${documentId}/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

/**
 * Download investment certificate
 */
export const downloadInvestmentCertificate = async (investmentId: number): Promise<Blob> => {
  const response = await fetch(`/api/investments/${investmentId}/certificate/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

// ==================== Installment Management APIs ====================

/**
 * Get installment plan details
 */
export const getInstallmentPlan = async (investmentId: number): Promise<ApiResponse<{
  planType: string;
  downPayment: number;
  totalInstallments: number;
  installmentAmount: number;
  paidInstallments: number;
  totalPaid: number;
  remainingAmount: number;
  nextDueDate?: string;
  nextDueAmount?: number;
  installments: Installment[];
}>> => {
  return apiGet<ApiResponse<{
    planType: string;
    downPayment: number;
    totalInstallments: number;
    installmentAmount: number;
    paidInstallments: number;
    totalPaid: number;
    remainingAmount: number;
    nextDueDate?: string;
    nextDueAmount?: number;
    installments: Installment[];
  }>>(`/investments/${investmentId}/installments`);
};

/**
 * Pay installment
 */
export const payInstallment = async (data: {
  investmentId: number;
  installmentNumber: number;
  paymentMethod: 'WALLET' | 'RAZORPAY';
}): Promise<ApiResponse<{
  installment: Installment;
  paymentUrl?: string;
  orderId?: string;
}>> => {
  return apiPost<ApiResponse<{
    installment: Installment;
    paymentUrl?: string;
    orderId?: string;
  }>>('/investments/installments/pay', data);
};

/**
 * Verify installment payment
 */
export const verifyInstallmentPayment = async (data: {
  investmentId: number;
  installmentNumber: number;
  paymentId: string;
  orderId: string;
  signature?: string;
}): Promise<ApiResponse<Installment>> => {
  return apiPost<ApiResponse<Installment>>('/investments/installments/verify-payment', data);
};

/**
 * Get overdue installments
 */
export const getOverdueInstallments = async (): Promise<ApiResponse<{
  investmentId: number;
  propertyTitle: string;
  installments: Installment[];
}[]>> => {
  return apiGet<ApiResponse<{
    investmentId: number;
    propertyTitle: string;
    installments: Installment[];
  }[]>>('/investments/installments/overdue');
};

/**
 * Get upcoming installments
 */
export const getUpcomingInstallments = async (days?: number): Promise<ApiResponse<{
  investmentId: number;
  propertyTitle: string;
  installments: Installment[];
}[]>> => {
  return apiGet<ApiResponse<{
    investmentId: number;
    propertyTitle: string;
    installments: Installment[];
  }[]>>('/investments/installments/upcoming', { days });
};

// ==================== Nominee Management APIs ====================

/**
 * Update nominee details
 */
export const updateNominee = async (investmentId: number, data: {
  name: string;
  relationship: string;
  contactNumber: string;
  dateOfBirth: string;
  address?: string;
}): Promise<ApiResponse<Investment>> => {
  return apiPut<ApiResponse<Investment>>(`/investments/${investmentId}/nominee`, data);
};

// ==================== Portfolio APIs ====================

/**
 * Get user portfolio summary
 */
export const getPortfolio = async (): Promise<ApiResponse<Portfolio>> => {
  return apiGet<ApiResponse<Portfolio>>('/investments/portfolio');
};

/**
 * Get portfolio performance data
 */
export const getPortfolioPerformance = async (params?: {
  period?: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'ALL';
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<{
  date: string;
  invested: number;
  currentValue: number;
}[]>> => {
  return apiGet<ApiResponse<{
    date: string;
    invested: number;
    currentValue: number;
  }[]>>('/investments/portfolio/performance', params);
};

/**
 * Get asset allocation
 */
export const getAssetAllocation = async (): Promise<ApiResponse<{
  propertyType: string;
  percentage: number;
  value: number;
  count: number;
}[]>> => {
  return apiGet<ApiResponse<{
    propertyType: string;
    percentage: number;
    value: number;
    count: number;
  }[]>>('/investments/portfolio/asset-allocation');
};

/**
 * Get portfolio returns breakdown
 */
export const getPortfolioReturns = async (): Promise<ApiResponse<{
  capitalAppreciation: number;
  roiEarned: number;
  rentalIncome: number;
  commissions: number;
  total: number;
  returnPercentage: number;
}>> => {
  return apiGet<ApiResponse<{
    capitalAppreciation: number;
    roiEarned: number;
    rentalIncome: number;
    commissions: number;
    total: number;
    returnPercentage: number;
  }>>('/investments/portfolio/returns');
};

// ==================== Investment Statistics APIs ====================

/**
 * Get investment statistics
 */
export const getInvestmentStats = async (): Promise<ApiResponse<{
  totalInvestments: number;
  totalAmount: number;
  activeInvestments: number;
  totalProperties: number;
  averageROI: number;
  totalReturns: number;
}>> => {
  return apiGet<ApiResponse<{
    totalInvestments: number;
    totalAmount: number;
    activeInvestments: number;
    totalProperties: number;
    averageROI: number;
    totalReturns: number;
  }>>('/investments/stats');
};

/**
 * Get monthly investment summary
 */
export const getMonthlyInvestmentSummary = async (params?: {
  year?: number;
  month?: number;
}): Promise<ApiResponse<{
  newInvestments: number;
  newInvestmentAmount: number;
  installmentsPaid: number;
  installmentAmount: number;
  totalReturns: number;
  appreciation: number;
}>> => {
  return apiGet<ApiResponse<{
    newInvestments: number;
    newInvestmentAmount: number;
    installmentsPaid: number;
    installmentAmount: number;
    totalReturns: number;
    appreciation: number;
  }>>('/investments/stats/monthly', params);
};

/**
 * Get investment trends
 */
export const getInvestmentTrends = async (params?: {
  period?: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
}): Promise<ApiResponse<{
  date: string;
  investments: number;
  amount: number;
}[]>> => {
  return apiGet<ApiResponse<{
    date: string;
    investments: number;
    amount: number;
  }[]>>('/investments/stats/trends', params);
};

// ==================== Investment Actions APIs ====================

/**
 * Cancel pending investment
 */
export const cancelInvestment = async (investmentId: number, reason: string): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/investments/${investmentId}/cancel`, { reason });
};

/**
 * Request investment closure
 */
export const requestInvestmentClosure = async (investmentId: number, data: {
  reason: string;
  transactionPin: string;
}): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/investments/${investmentId}/close-request`, data);
};
