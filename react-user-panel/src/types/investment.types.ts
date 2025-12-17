// Investment Types
export interface Investment {
  id: number;
  investmentId: string;
  property: {
    id: number;
    title: string;
    propertyType: string;
    image: string;
    location: string;
  };
  investmentAmount: number;
  currentValue: number;
  appreciation: number;
  appreciationPercentage: number;
  bvAllocated: number;
  investmentType: InvestmentType;
  installmentPlan?: InstallmentPlan;
  status: InvestmentStatus;
  nominee: NomineeDetails;
  investmentDate: string;
  lockInEndDate?: string;
  roiEarned: number;
  rentalIncomeEarned: number;
  totalReturns: number;
  returnPercentage: number;
  documents: InvestmentDocument[];
}

export type InvestmentType = 'FULL_PAYMENT' | 'INSTALLMENT';

export type InvestmentStatus = 'ACTIVE' | 'COMPLETED' | 'MATURED' | 'CANCELLED' | 'PENDING';

export interface InstallmentPlan {
  planType: 'MONTHLY' | 'QUARTERLY' | 'CUSTOM';
  downPayment: number;
  totalInstallments: number;
  installmentAmount: number;
  paidInstallments: number;
  totalPaid: number;
  remainingAmount: number;
  nextDueDate?: string;
  nextDueAmount?: number;
  installments: Installment[];
}

export interface Installment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'UPCOMING';
  paidDate?: string;
  transactionId?: string;
  penalty?: number;
}

export interface NomineeDetails {
  name: string;
  relationship: string;
  contactNumber: string;
  dateOfBirth: string;
  address?: string;
}

export interface InvestmentDocument {
  id: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
}

export interface InvestmentRequest {
  propertyId: number;
  investmentAmount: number;
  investmentType: InvestmentType;
  installmentPlan?: {
    planType: 'MONTHLY' | 'QUARTERLY' | 'CUSTOM';
    downPayment: number;
    totalInstallments: number;
  };
  nomineeDetails: NomineeDetails;
  paymentMethod: 'WALLET' | 'RAZORPAY';
}

export interface Portfolio {
  totalInvestment: number;
  currentValue: number;
  totalAppreciation: number;
  appreciationPercentage: number;
  totalProperties: number;
  totalReturns: number;
  returns: {
    capitalAppreciation: number;
    roiEarned: number;
    rentalIncome: number;
    commissions: number;
  };
  returnsRate: number;
  assetAllocation: AssetAllocation[];
  performanceData: PerformanceData[];
  properties: PropertyPerformance[];
}

export interface AssetAllocation {
  propertyType: string;
  percentage: number;
  value: number;
  count: number;
}

export interface PerformanceData {
  date: string;
  invested: number;
  currentValue: number;
}

export interface PropertyPerformance {
  propertyId: number;
  propertyName: string;
  propertyType: string;
  invested: number;
  currentValue: number;
  appreciation: number;
  appreciationPercentage: number;
  roiEarned: number;
  status: string;
}
