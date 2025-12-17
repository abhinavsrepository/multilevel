import axiosInstance from './axiosConfig';

export interface CreateInvestmentData {
  propertyId: string;
  shares: number;
  amount: number;
  paymentMethod: 'WALLET' | 'ONLINE' | 'BANK_TRANSFER';
}

export interface Investment {
  id: string;
  userId: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    propertyType: string;
    location: {
      city: string;
      state: string;
    };
    images: string[];
  };
  shares: number;
  investmentAmount: number;
  currentValue: number;
  returns: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXIT_REQUESTED' | 'EXITED';
  investmentDate: string;
  maturityDate?: string;
  exitRequestDate?: string;
  exitDate?: string;
}

export interface InvestmentFilters {
  status?: string;
  propertyType?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface Portfolio {
  totalInvested: number;
  currentValue: number;
  totalReturns: number;
  roi: number;
  activeInvestments: number;
  completedInvestments: number;
  investments: Investment[];
  performanceChart: Array<{
    month: string;
    invested: number;
    returns: number;
  }>;
  assetAllocation: Array<{
    propertyType: string;
    value: number;
    percentage: number;
  }>;
}

export interface ExitRequestData {
  reason?: string;
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

const investmentApi = {
  /**
   * Create a new investment
   */
  createInvestment: async (data: CreateInvestmentData): Promise<ApiResponse<Investment>> => {
    const response = await axiosInstance.post<ApiResponse<Investment>>('/investments', data);
    return response.data;
  },

  /**
   * Get user's investments
   */
  getMyInvestments: async (params?: InvestmentFilters): Promise<ApiResponse<Investment[]>> => {
    const response = await axiosInstance.get<ApiResponse<Investment[]>>('/investments/my-investments', {
      params,
    });
    return response.data;
  },

  /**
   * Get investment details by ID
   */
  getInvestmentDetails: async (id: string): Promise<ApiResponse<Investment>> => {
    const response = await axiosInstance.get<ApiResponse<Investment>>(`/investments/${id}`);
    return response.data;
  },

  /**
   * Get portfolio summary
   */
  getPortfolio: async (): Promise<ApiResponse<Portfolio>> => {
    const response = await axiosInstance.get<ApiResponse<Portfolio>>('/investments/portfolio');
    return response.data;
  },

  /**
   * Request exit from investment
   */
  requestExit: async (id: string, data?: ExitRequestData): Promise<ApiResponse<Investment>> => {
    const response = await axiosInstance.post<ApiResponse<Investment>>(
      `/investments/${id}/request-exit`,
      data || {}
    );
    return response.data;
  },
};

export default investmentApi;
