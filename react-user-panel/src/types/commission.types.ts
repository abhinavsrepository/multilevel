// Commission Types
export interface CommissionSummary {
  totalEarnings: number;
  thisMonth: number;
  today: number;
  byType: CommissionByType[];
  trend: CommissionTrend[];
  distribution: CommissionDistribution[];
}

export interface CommissionByType {
  type: CommissionType;
  name: string;
  icon: string;
  totalEarned: number;
  thisMonth: number;
  count: number;
  color: string;
}

export interface CommissionTrend {
  date: string;
  total: number;
  direct: number;
  binary: number;
  level: number;
  rental: number;
  appreciation: number;
  rank: number;
  leadership: number;
}

export interface CommissionDistribution {
  type: CommissionType;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface Commission {
  id: number;
  commissionId: string;
  date: string;
  commissionType: CommissionType;
  fromUser?: {
    userId: string;
    name: string;
  };
  property?: {
    id: number;
    title: string;
  };
  description: string;
  baseAmount: number;
  percentage?: number;
  bv?: number;
  commissionAmount: number;
  status: CommissionStatus;
  calculation: CommissionCalculation;
  paymentInfo?: {
    walletType: string;
    transactionId: string;
    paidDate: string;
  };
}

export type CommissionType =
  | 'DIRECT_REFERRAL'
  | 'BINARY_PAIRING'
  | 'LEVEL_COMMISSION'
  | 'RENTAL_INCOME'
  | 'PROPERTY_APPRECIATION'
  | 'RANK_BONUS'
  | 'LEADERSHIP_BONUS';

export type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface CommissionCalculation {
  baseAmount: number;
  rate: number;
  bv?: number;
  cappingApplied: boolean;
  originalAmount?: number;
  cappedAmount?: number;
  level?: number;
  details: string;
}

export interface CommissionFilters {
  commissionType?: CommissionType;
  status?: CommissionStatus;
  startDate?: string;
  endDate?: string;
  fromUser?: string;
}

export interface CommissionStats {
  total: number;
  pending: number;
  paid: number;
}
