export interface Investment {
  id: number;
  investmentId: string;
  user: {
    userId: string;
    fullName: string;
    email: string;
    mobile: string;
  };
  property: {
    propertyId: string;
    title: string;
    imageUrl?: string;
    city: string;
  };
  investmentAmount: number;
  bvAllocated: number;
  investmentType: 'FULL' | 'INSTALLMENT' | 'PARTIAL';
  totalPaid: number;
  pendingAmount: number;
  commissionStatus: 'PENDING' | 'GENERATED' | 'PAID';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'MATURED';
  investmentDate: string;
  maturityDate?: string;

  // Nominee
  nomineeName?: string;
  nomineeRelation?: string;
  nomineeDOB?: string;

  // Documents
  agreementUrl?: string;
  certificateUrl?: string;

  // Returns
  currentPropertyValue: number;
  roiEarned: number;
  rentalIncomeEarned: number;

  createdAt: string;
  updatedAt: string;
}

export interface Installment {
  id: number;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paidDate?: string;
  paidAmount?: number;
  transactionId?: string;
  lateFee?: number;
}

export interface InvestmentFilters {
  search?: string;
  status?: string;
  investmentType?: string;
  propertyType?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}
