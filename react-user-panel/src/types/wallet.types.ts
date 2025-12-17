// Wallet Types
export interface WalletBalance {
  commissionWallet: number;
  investmentWallet: number;
  rentalIncomeWallet: number;
  roiWallet: number;
  totalBalance: number;
}

export interface Transaction {
  id: number;
  transactionId: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  status: TransactionStatus;
  referenceId?: string;
  paymentMethod?: string;
  fromTo?: string;
  remarks?: string;
  wallet: WalletType;
}

export type TransactionType = 'CREDIT' | 'DEBIT';

export type TransactionCategory =
  | 'COMMISSION'
  | 'WITHDRAWAL'
  | 'INVESTMENT'
  | 'REFUND'
  | 'TRANSFER'
  | 'RENTAL'
  | 'ROI'
  | 'BONUS'
  | 'PENALTY'
  | 'DEPOSIT';

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';

export type WalletType = 'COMMISSION' | 'INVESTMENT' | 'RENTAL' | 'ROI' | 'ALL';

export interface TransactionFilters {
  type?: TransactionType;
  category?: TransactionCategory;
  wallet?: WalletType;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface TransactionSummary {
  totalCredits: number;
  totalDebits: number;
  netChange: number;
}

export interface WithdrawalRequest {
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'UPI';
  bankAccountId?: number;
  upiId?: string;
  transactionPin: string;
}

export interface Withdrawal {
  id: number;
  withdrawalId: string;
  requestDate: string;
  requestedAmount: number;
  tds: number;
  adminCharge: number;
  netAmount: number;
  paymentMethod: 'BANK_TRANSFER' | 'UPI';
  bankDetails?: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  };
  upiId?: string;
  status: WithdrawalStatus;
  approvedDate?: string;
  completedDate?: string;
  utrNumber?: string;
  rejectionReason?: string;
  timeline: WithdrawalTimeline[];
}

export type WithdrawalStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface WithdrawalTimeline {
  status: WithdrawalStatus;
  date?: string;
  note?: string;
}

export interface WithdrawalRules {
  minimumWithdrawal: number;
  maximumDailyWithdrawal: number;
  tdsPercentage: number;
  tdsThreshold: number;
  adminChargePercentage: number;
  processingTime: string;
}
