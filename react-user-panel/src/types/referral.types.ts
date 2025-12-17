// Referral Types
export interface ReferralData {
  referralCode: string;
  referralLink: string;
  shortLink?: string;
  qrCodeUrl?: string;
  stats: ReferralStats;
}

export interface ReferralStats {
  totalReferrals: number;
  thisMonth: number;
  activeReferrals: number;
  totalEarnings: number;
  linkClicks: number;
  conversionRate: number;
}

export interface ReferralMessage {
  id: number;
  name: string;
  content: string;
  variables: string[];
}

export interface SharePlatform {
  name: string;
  icon: string;
  color: string;
  action: string;
}

export interface ReferralInvite {
  email?: string;
  mobile?: string;
  personalMessage?: string;
}

export interface LinkTracking {
  totalClicks: number;
  conversions: number;
  conversionRate: number;
  clicksByDate: ClickData[];
  clicksBySource: SourceData[];
}

export interface ClickData {
  date: string;
  clicks: number;
}

export interface SourceData {
  source: string;
  clicks: number;
  conversions: number;
}
