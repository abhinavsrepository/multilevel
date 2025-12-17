// User Types
export interface User {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  profilePicture?: string;
  coverPhoto?: string;
  rank: Rank;
  sponsorId?: string;
  sponsorName?: string;
  placement: 'LEFT' | 'RIGHT' | 'AUTO';
  levelInTree: number;
  memberSince: string;
  kycStatus: KYCStatus;
  kycLevel: 'BASIC' | 'FULL' | 'PREMIUM';
  investmentLimit: number;
  isActive: boolean;
  isVerified: boolean;
  emailVerified: boolean;
  mobileVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface UserStats {
  totalInvestment: number;
  currentPortfolioValue: number;
  totalEarnings: number;
  availableBalance: number;
  totalWithdrawn: number;
  teamSize: number;
  leftLeg: number;
  rightLeg: number;
  activeProperties: number;
  todayIncome: number;
  directReferrals: number;
}

export interface Rank {
  id: number;
  name: string;
  displayOrder: number;
  icon?: string;
  badge?: string;
  requiredDirectReferrals: number;
  requiredTeamInvestment: number;
  requiredPersonalInvestment: number;
  requireActiveLegs: boolean;
  oneTimeBonus: number;
  monthlyBonus: number;
  commissionBoost: number;
  benefits: string[];
}

export interface RankProgress {
  currentRank: Rank;
  nextRank?: Rank;
  progress: {
    directReferrals: {
      current: number;
      required: number;
      percentage: number;
    };
    teamInvestment: {
      current: number;
      required: number;
      percentage: number;
    };
    personalInvestment: {
      current: number;
      required: number;
      percentage: number;
    };
    activeLegs: {
      leftActive: boolean;
      rightActive: boolean;
      achieved: boolean;
    };
  };
  overallProgress: number;
}

export type KYCStatus = 'PENDING' | 'BASIC' | 'FULL' | 'PREMIUM' | 'REJECTED';

export interface KYCDocument {
  id: number;
  documentType: DocumentType;
  documentNumber?: string;
  frontImage?: string;
  backImage?: string;
  status: 'NOT_UPLOADED' | 'UPLOADED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  uploadedDate?: string;
  verifiedDate?: string;
  rejectionReason?: string;
}

export type DocumentType =
  | 'PAN_CARD'
  | 'AADHAAR_CARD'
  | 'BANK_PROOF'
  | 'ADDRESS_PROOF'
  | 'INCOME_PROOF'
  | 'PHOTO_ID'
  | 'SELFIE_WITH_PAN';

export interface BankAccount {
  id: number;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName?: string;
  accountType: 'SAVINGS' | 'CURRENT';
  upiId?: string;
  isPrimary: boolean;
  isVerified: boolean;
  createdDate: string;
}

export interface Session {
  id: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface LoginHistory {
  id: number;
  loginDate: string;
  ipAddress: string;
  deviceName: string;
  browser: string;
  location?: string;
  status: 'SUCCESS' | 'FAILED';
}
