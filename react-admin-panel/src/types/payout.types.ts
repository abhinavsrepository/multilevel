export interface Payout {
  id: number;
  payoutId: string;
  user: {
    userId: string;
    fullName: string;
    email: string;
    mobile: string;
    profilePicture?: string;
  };
  requestedAmount: number;
  tdsDeducted: number;
  tdsPercent: number;
  adminCharge: number;
  adminChargePercent: number;
  otherDeductions: number;
  netAmount: number;
  walletBalanceBefore: number;
  paymentMethod: 'BANK_TRANSFER' | 'UPI';

  // Bank Details
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;

  // UPI
  upiId?: string;

  // KYC
  kycStatus: string;

  // Status
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';

  // Processing
  utrNumber?: string;
  processedBy?: string;
  processedDate?: string;
  rejectionReason?: string;

  // Dates
  requestedDate: string;
  approvedDate?: string;
  completedDate?: string;

  createdAt: string;
  updatedAt: string;
}

export interface PayoutFilters {
  search?: string;
  status?: string;
  priority?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PayoutHistory {
  payoutId: string;
  requestedAmount: number;
  netAmount: number;
  status: string;
  requestedDate: string;
}
