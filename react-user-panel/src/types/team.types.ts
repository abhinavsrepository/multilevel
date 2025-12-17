// Team & Genealogy Types
export interface TeamStats {
  totalTeam: number;
  leftLeg: number;
  rightLeg: number;
  active: number;
  inactive: number;
  directReferrals: number;
  directReferralsThisMonth: number;
  teamBV: number;
  leftBV: number;
  rightBV: number;
  matchingBV: number;
  carryForward: number;
  teamInvestment: number;
  teamInvestmentThisMonth: number;
}

export interface TeamMember {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  profilePicture?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  rank: {
    id: number;
    name: string;
    icon?: string;
  };
  joiningDate: string;
  totalInvestment: number;
  teamSize: number;
  leftLeg: number;
  rightLeg: number;
  bv: {
    personal: number;
    left: number;
    right: number;
    total: number;
  };
  level?: number;
  placement?: 'LEFT' | 'RIGHT';
  sponsorId?: string;
}

export interface TreeNode {
  id: number;
  userId: string;
  name: string;
  profilePicture?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  rank?: string;
  joiningDate: string;
  bv: {
    left: number;
    right: number;
    total: number;
  };
  teamSize: number;
  totalInvestment: number;
  placement: 'LEFT' | 'RIGHT' | 'ROOT';
  children?: TreeNode[];
}

export interface DirectReferral extends TeamMember {
  isActive: boolean;
}

// Enhanced Direct Referral Performance for Leadership Dashboard
export interface DirectReferralPerformance {
  id: number;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  rank: {
    name: string;
  };
  joiningDate: string;
  lastTopupDate: string | null;
  referralSalesVolume: number; // Total property investments (RSV)
  l2DownlineCount: number; // Number of direct referrals of this member
  directCommission: number; // Commission earned by upline from this referral
  performanceStatus: 'GREEN' | 'YELLOW' | 'RED'; // Performance indicator
  performanceColor: string; // Color code for status
  profilePicture?: string;
  personalBv: number;
}

export interface TeamReport {
  summary: {
    totalMembers: number;
    levelBreakdown: LevelBreakdown[];
    legComparison: {
      left: number;
      right: number;
    };
  };
  businessVolume: {
    personalBV: number;
    teamBV: number;
    leftBV: number;
    rightBV: number;
    matchingBV: number;
    carryForward: number;
  };
  performance: {
    totalInvestment: number;
    activeInvestors: number;
    propertiesInvested: number;
  };
  topPerformers: {
    byInvestment: TeamMember[];
    byTeamSize: TeamMember[];
    byEarnings: TeamMember[];
  };
  levelAnalysis: LevelAnalysis[];
}

export interface LevelBreakdown {
  level: number;
  members: number;
  percentage: number;
}

export interface LevelAnalysis {
  level: number;
  members: number;
  active: number;
  investment: number;
  bv: number;
}

export interface TeamGrowth {
  date: string;
  total: number;
  leftLeg: number;
  rightLeg: number;
}
