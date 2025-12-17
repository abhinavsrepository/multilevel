export interface Commission {
  id: number;
  commissionId: string;
  user: {
    userId: string;
    fullName: string;
    email: string;
  };
  commissionType:
    | 'DIRECT_REFERRAL'
    | 'BINARY_PAIRING'
    | 'LEVEL_COMMISSION'
    | 'RANK_BONUS'
    | 'LEADERSHIP_BONUS'
    | 'RENTAL_INCOME'
    | 'PROPERTY_APPRECIATION'
    | 'ROI';
  amount: number;
  fromUser?: {
    userId: string;
    fullName: string;
  };
  property?: {
    propertyId: string;
    title: string;
  };
  bv?: number;
  description: string;
  calculationDetails?: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'HELD' | 'CANCELLED';
  creditedDate?: string;
  createdAt: string;
}

export interface CommissionFilters {
  search?: string;
  commissionType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  userId?: string;
}

export interface CommissionSettings {
  directReferralCommissionPercent: number;
  binaryPairingBonus: number;
  binaryBVRequired: number;
  binaryDailyCap: number;
  binaryWeeklyCap: number;
  spilloverEnabled: boolean;
  levelCommissionPercents: number[];
  maxLevelDepth: number;
  maxROICap: number;
}
