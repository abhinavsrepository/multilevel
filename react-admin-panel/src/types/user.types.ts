export interface User {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  mobile: string;
  mobileVerified: boolean;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  profilePicture?: string;

  // MLM Info
  sponsorId?: string;
  sponsorName?: string;
  placementId?: string;
  placement?: 'LEFT' | 'RIGHT';
  level: number;
  rank?: Rank;
  rankName?: string;
  rankAchievedDate?: string;

  // BV Info
  leftBV: number;
  rightBV: number;
  carryForwardLeft: number;
  carryForwardRight: number;

  // Team Info
  totalTeamSize: number;
  leftLegCount: number;
  rightLegCount: number;
  directReferrals: number;

  // Financial
  totalInvestment: number;
  currentPortfolioValue: number;
  totalEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
  investmentWallet: number;
  commissionWallet: number;
  rentalWallet: number;
  roiWallet: number;
  tdsDeducted?: number; // Added for Governance view

  // KYC
  kycStatus: 'PENDING' | 'BASIC' | 'FULL' | 'PREMIUM' | 'REJECTED' | 'APPROVED' | 'VERIFIED';
  kycLevel?: string;

  // Status
  status: 'ACTIVE' | 'PENDING' | 'BLOCKED' | 'INACTIVE';

  // Auth
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SUPPORT' | 'MEMBER';
  lastLogin?: string;
  ipAddress?: string;
  deviceInfo?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface Rank {
  id: number;
  name: string;
  displayOrder: number;
  directReferralsRequired: number;
  teamInvestmentRequired: number;
  personalInvestmentRequired: number;
  activeLegsRequired: number;
  oneTimeBonus: number;
  monthlyLeadershipBonus: number;
  commissionBoost: number;
  benefits?: any[];
  active: boolean;
}

export interface UserFilters {
  search?: string;
  status?: string;
  kycStatus?: string;
  rank?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  sponsorCode?: string;
  placement?: 'LEFT' | 'RIGHT' | 'AUTO';
  initialPackage?: number;
  role?: string;
  status?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status?: string;
  kycStatus?: string;
}

export interface BinaryTreeNode {
  user: User;
  left?: BinaryTreeNode;
  right?: BinaryTreeNode;
  leftBV: number;
  rightBV: number;
}
