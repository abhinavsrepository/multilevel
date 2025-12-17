export interface SystemSettings {
  // Company
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  supportEmail: string;
  contactPhone: string;
  address: string;
  gstNumber: string;
  panNumber: string;

  // MLM
  binaryPairingBonus: number;
  binaryDailyCap: number;
  binaryWeeklyCap: number;
  spilloverEnabled: boolean;
  directReferralBonus: number;
  levelCommissionPercents: number[];
  maxLevelDepth: number;
  maxROICap: number;

  // Investment
  minimumInvestmentAmount: number;
  lockInPeriodMonths: number;
  earlyExitPenaltyPercent: number;
  installmentLateFee: number;

  // Payout
  minimumWithdrawalAmount: number;
  maximumDailyWithdrawal: number;
  tdsPercent: number;
  adminChargePercent: number;
  payoutProcessingDays: number;
  autoApprovalThreshold: number;

  // KYC
  requiredDocuments: string[];
  autoApprovalForBasicKYC: boolean;
  investmentLimitsByKYCLevel: Record<string, number>;

  // Email
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;

  // SMS
  smsProvider: string;
  smsApiKey: string;
  smsSenderId: string;

  // Payment
  razorpayKeyId: string;
  razorpayKeySecret: string;
  paymentTestMode: boolean;

  // Security
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  twoFactorEnabled: boolean;
  loginAttemptLimit: number;
  lockoutDurationMinutes: number;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SUPPORT';
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: string;
  permissions: string[];
  createdAt: string;
}

export interface CreateAdminRequest {
  fullName: string;
  email: string;
  role: string;
  password?: string;
  permissions: string[];
  sendWelcomeEmail: boolean;
}
