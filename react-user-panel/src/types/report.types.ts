// Report Types
export interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'FINANCIAL' | 'TEAM' | 'TAX' | 'INVESTMENT';
}

export interface ReportRequest {
  reportType: string;
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
  format: 'PDF' | 'EXCEL' | 'CSV';
}

export interface MonthlyStatement {
  month: string;
  year: number;
  openingBalance: number;
  totalCredits: number;
  totalDebits: number;
  closingBalance: number;
  transactions: MonthlyTransaction[];
  commissionSummary: MonthlyCommissionSummary[];
  investmentSummary: MonthlyInvestmentSummary;
  withdrawalSummary: MonthlyWithdrawalSummary;
}

export interface MonthlyTransaction {
  date: string;
  type: string;
  category: string;
  description: string;
  credit: number;
  debit: number;
  balance: number;
}

export interface MonthlyCommissionSummary {
  type: string;
  count: number;
  amount: number;
}

export interface MonthlyInvestmentSummary {
  newInvestments: number;
  newInvestmentAmount: number;
  installmentsPaid: number;
  installmentAmount: number;
  totalInvested: number;
}

export interface MonthlyWithdrawalSummary {
  requestCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalRequested: number;
  totalApproved: number;
  totalWithdrawn: number;
}

export interface TaxReport {
  financialYear: string;
  panNumber: string;
  totalIncome: number;
  totalCommission: number;
  totalInterest: number;
  totalRental: number;
  totalTDS: number;
  tdsBreakdown: TDSBreakdown[];
  form26AS: boolean;
}

export interface TDSBreakdown {
  month: string;
  income: number;
  tdsDeducted: number;
  tdsPercentage: number;
}
