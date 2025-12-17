import { apiGet, apiPost } from './config/axiosConfig';
import {
  ApiResponse,
  ReportType,
  ReportRequest,
  MonthlyStatement,
  TaxReport,
} from '@/types';

// ==================== Report Types APIs ====================

/**
 * Get available report types
 */
export const getReportTypes = async (): Promise<ApiResponse<ReportType[]>> => {
  return apiGet<ApiResponse<ReportType[]>>('/reports/types');
};

/**
 * Get report types by category
 */
export const getReportTypesByCategory = async (
  category: 'FINANCIAL' | 'TEAM' | 'TAX' | 'INVESTMENT'
): Promise<ApiResponse<ReportType[]>> => {
  return apiGet<ApiResponse<ReportType[]>>(`/reports/types/category/${category}`);
};

// ==================== Generate Report APIs ====================

/**
 * Generate report
 */
export const generateReport = async (data: ReportRequest): Promise<ApiResponse<{
  reportId: string;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
  estimatedTime?: string;
}>> => {
  return apiPost<ApiResponse<{
    reportId: string;
    status: 'GENERATING' | 'COMPLETED' | 'FAILED';
    downloadUrl?: string;
    estimatedTime?: string;
  }>>('/reports/generate', data);
};

/**
 * Check report generation status
 */
export const checkReportStatus = async (reportId: string): Promise<ApiResponse<{
  reportId: string;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  downloadUrl?: string;
  error?: string;
}>> => {
  return apiGet<ApiResponse<{
    reportId: string;
    status: 'GENERATING' | 'COMPLETED' | 'FAILED';
    progress?: number;
    downloadUrl?: string;
    error?: string;
  }>>(`/reports/status/${reportId}`);
};

/**
 * Download generated report
 */
export const downloadReport = async (reportId: string): Promise<Blob> => {
  const response = await fetch(`/api/reports/download/${reportId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

/**
 * Email report
 */
export const emailReport = async (reportId: string, email?: string): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/reports/${reportId}/email`, { email });
};

// ==================== Monthly Statement APIs ====================

/**
 * Get monthly statement
 */
export const getMonthlyStatement = async (params: {
  year: number;
  month: number;
}): Promise<ApiResponse<MonthlyStatement>> => {
  return apiGet<ApiResponse<MonthlyStatement>>('/reports/monthly-statement', params);
};

/**
 * Download monthly statement
 */
export const downloadMonthlyStatement = async (params: {
  year: number;
  month: number;
  format: 'PDF' | 'EXCEL' | 'CSV';
}): Promise<Blob> => {
  const queryParams = new URLSearchParams({
    year: params.year.toString(),
    month: params.month.toString(),
    format: params.format,
  });

  const response = await fetch(`/api/reports/monthly-statement/download?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

/**
 * Email monthly statement
 */
export const emailMonthlyStatement = async (params: {
  year: number;
  month: number;
  email?: string;
}): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/reports/monthly-statement/email', params);
};

/**
 * Get available monthly statements
 */
export const getAvailableMonthlyStatements = async (): Promise<ApiResponse<{
  year: number;
  month: number;
  available: boolean;
}[]>> => {
  return apiGet<ApiResponse<{
    year: number;
    month: number;
    available: boolean;
  }[]>>('/reports/monthly-statement/available');
};

// ==================== Tax Report APIs ====================

/**
 * Get tax report
 */
export const getTaxReport = async (financialYear: string): Promise<ApiResponse<TaxReport>> => {
  return apiGet<ApiResponse<TaxReport>>('/reports/tax-report', { financialYear });
};

/**
 * Download tax report
 */
export const downloadTaxReport = async (params: {
  financialYear: string;
  format: 'PDF' | 'EXCEL';
}): Promise<Blob> => {
  const queryParams = new URLSearchParams({
    financialYear: params.financialYear,
    format: params.format,
  });

  const response = await fetch(`/api/reports/tax-report/download?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

/**
 * Email tax report
 */
export const emailTaxReport = async (params: {
  financialYear: string;
  email?: string;
}): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/reports/tax-report/email', params);
};

/**
 * Get available financial years for tax reports
 */
export const getAvailableFinancialYears = async (): Promise<ApiResponse<string[]>> => {
  return apiGet<ApiResponse<string[]>>('/reports/tax-report/available-years');
};

// ==================== Investment Report APIs ====================

/**
 * Get investment summary report
 */
export const getInvestmentSummaryReport = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<{
  totalInvestments: number;
  totalAmount: number;
  totalReturns: number;
  roi: number;
  byProperty: {
    propertyId: number;
    propertyName: string;
    invested: number;
    currentValue: number;
    returns: number;
  }[];
  byStatus: {
    status: string;
    count: number;
    amount: number;
  }[];
}>> => {
  return apiGet<ApiResponse<{
    totalInvestments: number;
    totalAmount: number;
    totalReturns: number;
    roi: number;
    byProperty: {
      propertyId: number;
      propertyName: string;
      invested: number;
      currentValue: number;
      returns: number;
    }[];
    byStatus: {
      status: string;
      count: number;
      amount: number;
    }[];
  }>>('/reports/investment-summary', params);
};

/**
 * Download investment report
 */
export const downloadInvestmentReport = async (params: {
  startDate: string;
  endDate: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
}): Promise<Blob> => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    format: params.format,
  });

  const response = await fetch(`/api/reports/investment-report/download?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

// ==================== Commission Report APIs ====================

/**
 * Get commission summary report
 */
export const getCommissionSummaryReport = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<{
  totalEarnings: number;
  totalCommissions: number;
  byType: {
    type: string;
    count: number;
    amount: number;
  }[];
  byMonth: {
    month: string;
    amount: number;
  }[];
}>> => {
  return apiGet<ApiResponse<{
    totalEarnings: number;
    totalCommissions: number;
    byType: {
      type: string;
      count: number;
      amount: number;
    }[];
    byMonth: {
      month: string;
      amount: number;
    }[];
  }>>('/reports/commission-summary', params);
};

/**
 * Download commission report
 */
export const downloadCommissionReport = async (params: {
  startDate: string;
  endDate: string;
  commissionType?: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
}): Promise<Blob> => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    format: params.format,
    ...(params.commissionType && { commissionType: params.commissionType }),
  });

  const response = await fetch(`/api/reports/commission-report/download?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

// ==================== Team Report APIs ====================

/**
 * Get team summary report
 */
export const getTeamSummaryReport = async (): Promise<ApiResponse<{
  totalTeam: number;
  directReferrals: number;
  activeMembers: number;
  teamBV: number;
  teamInvestment: number;
  byLevel: {
    level: number;
    members: number;
    investment: number;
    bv: number;
  }[];
  byRank: {
    rank: string;
    count: number;
  }[];
}>> => {
  return apiGet<ApiResponse<{
    totalTeam: number;
    directReferrals: number;
    activeMembers: number;
    teamBV: number;
    teamInvestment: number;
    byLevel: {
      level: number;
      members: number;
      investment: number;
      bv: number;
    }[];
    byRank: {
      rank: string;
      count: number;
    }[];
  }>>('/reports/team-summary');
};

/**
 * Download team report
 */
export const downloadTeamReport = async (params: {
  reportType: 'FULL' | 'DIRECT' | 'LEVEL' | 'BINARY';
  format: 'PDF' | 'EXCEL' | 'CSV';
  level?: number;
  placement?: 'LEFT' | 'RIGHT';
}): Promise<Blob> => {
  const queryParams = new URLSearchParams({
    reportType: params.reportType,
    format: params.format,
    ...(params.level && { level: params.level.toString() }),
    ...(params.placement && { placement: params.placement }),
  });

  const response = await fetch(`/api/reports/team-report/download?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

// ==================== Transaction Report APIs ====================

/**
 * Get transaction summary report
 */
export const getTransactionSummaryReport = async (params?: {
  startDate?: string;
  endDate?: string;
  walletType?: string;
}): Promise<ApiResponse<{
  totalCredits: number;
  totalDebits: number;
  netChange: number;
  transactionCount: number;
  byCategory: {
    category: string;
    credits: number;
    debits: number;
  }[];
  byWallet: {
    wallet: string;
    balance: number;
  }[];
}>> => {
  return apiGet<ApiResponse<{
    totalCredits: number;
    totalDebits: number;
    netChange: number;
    transactionCount: number;
    byCategory: {
      category: string;
      credits: number;
      debits: number;
    }[];
    byWallet: {
      wallet: string;
      balance: number;
    }[];
  }>>('/reports/transaction-summary', params);
};

/**
 * Download transaction report
 */
export const downloadTransactionReport = async (params: {
  startDate: string;
  endDate: string;
  walletType?: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
}): Promise<Blob> => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    format: params.format,
    ...(params.walletType && { walletType: params.walletType }),
  });

  const response = await fetch(`/api/reports/transaction-report/download?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

// ==================== Payout Report APIs ====================

/**
 * Get payout summary report
 */
export const getPayoutSummaryReport = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<{
  totalRequested: number;
  totalApproved: number;
  totalPaid: number;
  totalTDS: number;
  totalCharges: number;
  requestCount: number;
  approvedCount: number;
  rejectedCount: number;
  byMonth: {
    month: string;
    requested: number;
    paid: number;
  }[];
}>> => {
  return apiGet<ApiResponse<{
    totalRequested: number;
    totalApproved: number;
    totalPaid: number;
    totalTDS: number;
    totalCharges: number;
    requestCount: number;
    approvedCount: number;
    rejectedCount: number;
    byMonth: {
      month: string;
      requested: number;
      paid: number;
    }[];
  }>>('/reports/payout-summary', params);
};

/**
 * Download payout report
 */
export const downloadPayoutReport = async (params: {
  startDate: string;
  endDate: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
}): Promise<Blob> => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    format: params.format,
  });

  const response = await fetch(`/api/reports/payout-report/download?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

// ==================== Performance Report APIs ====================

/**
 * Get overall performance report
 */
export const getPerformanceReport = async (params?: {
  period?: 'MONTH' | 'QUARTER' | 'YEAR';
  year?: number;
  quarter?: number;
  month?: number;
}): Promise<ApiResponse<{
  totalInvestment: number;
  totalEarnings: number;
  totalWithdrawals: number;
  netBalance: number;
  roi: number;
  teamGrowth: number;
  rankProgress: number;
  highlights: string[];
}>> => {
  return apiGet<ApiResponse<{
    totalInvestment: number;
    totalEarnings: number;
    totalWithdrawals: number;
    netBalance: number;
    roi: number;
    teamGrowth: number;
    rankProgress: number;
    highlights: string[];
  }>>('/reports/performance', params);
};

/**
 * Download performance report
 */
export const downloadPerformanceReport = async (params: {
  period: 'MONTH' | 'QUARTER' | 'YEAR';
  year: number;
  quarter?: number;
  month?: number;
  format: 'PDF' | 'EXCEL';
}): Promise<Blob> => {
  const queryParams = new URLSearchParams({
    period: params.period,
    year: params.year.toString(),
    format: params.format,
    ...(params.quarter && { quarter: params.quarter.toString() }),
    ...(params.month && { month: params.month.toString() }),
  });

  const response = await fetch(`/api/reports/performance-report/download?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

// ==================== Report History APIs ====================

/**
 * Get generated reports history
 */
export const getReportHistory = async (params?: {
  page?: number;
  size?: number;
  reportType?: string;
}): Promise<ApiResponse<{
  content: {
    reportId: string;
    reportType: string;
    reportName: string;
    generatedDate: string;
    format: string;
    status: string;
    downloadUrl?: string;
  }[];
  totalElements: number;
  totalPages: number;
}>> => {
  return apiGet<ApiResponse<{
    content: {
      reportId: string;
      reportType: string;
      reportName: string;
      generatedDate: string;
      format: string;
      status: string;
      downloadUrl?: string;
    }[];
    totalElements: number;
    totalPages: number;
  }>>('/reports/history', params);
};

/**
 * Delete report from history
 */
export const deleteReportFromHistory = async (reportId: string): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/reports/${reportId}/delete`);
};

// ==================== Annual Report APIs ====================

/**
 * Get annual report
 */
export const getAnnualReport = async (year: number): Promise<ApiResponse<{
  year: number;
  totalInvestment: number;
  totalEarnings: number;
  totalWithdrawals: number;
  teamGrowth: number;
  rankAchieved: string;
  monthlyBreakdown: {
    month: string;
    investment: number;
    earnings: number;
    withdrawals: number;
  }[];
}>> => {
  return apiGet<ApiResponse<{
    year: number;
    totalInvestment: number;
    totalEarnings: number;
    totalWithdrawals: number;
    teamGrowth: number;
    rankAchieved: string;
    monthlyBreakdown: {
      month: string;
      investment: number;
      earnings: number;
      withdrawals: number;
    }[];
  }>>('/reports/annual', { year });
};

/**
 * Download annual report
 */
export const downloadAnnualReport = async (year: number, format: 'PDF' | 'EXCEL'): Promise<Blob> => {
  const response = await fetch(`/api/reports/annual/download?year=${year}&format=${format}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

// ==================== Custom Report APIs ====================

/**
 * Create custom report request
 */
export const createCustomReportRequest = async (data: {
  reportName: string;
  description: string;
  dataPoints: string[];
  filters?: Record<string, any>;
}): Promise<ApiResponse<{
  requestId: string;
  status: string;
  estimatedTime?: string;
}>> => {
  return apiPost<ApiResponse<{
    requestId: string;
    status: string;
    estimatedTime?: string;
  }>>('/reports/custom/request', data);
};

/**
 * Get custom report requests
 */
export const getCustomReportRequests = async (): Promise<ApiResponse<{
  requestId: string;
  reportName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  requestDate: string;
  completionDate?: string;
  downloadUrl?: string;
}[]>> => {
  return apiGet<ApiResponse<{
    requestId: string;
    reportName: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
    requestDate: string;
    completionDate?: string;
    downloadUrl?: string;
  }[]>>('/reports/custom/requests');
};
