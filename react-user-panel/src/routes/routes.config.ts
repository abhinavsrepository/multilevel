import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

/**
 * Route Configuration Type
 */
export interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType<any>> | React.ComponentType<any>;
  layout: 'auth' | 'dashboard' | 'blank';
  protected: boolean;
  breadcrumb?: string;
  title?: string;
  children?: RouteConfig[];
}

/**
 * Lazy load components for code splitting
 */

// ==================== Auth Pages ====================
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const RegisterSimple = lazy(() => import('@/pages/auth/RegisterSimple'));
const OTPVerification = lazy(() => import('@/pages/auth/OTPVerification'));
const OTPVerificationSimple = lazy(() => import('@/pages/auth/OTPVerificationSimple'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));

// ==================== Dashboard ====================
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));

// ==================== Profile ====================
const Profile = lazy(() => import('@/pages/profile/Profile'));
const EditProfile = lazy(() => import('@/pages/profile/EditProfile'));
const DigitalIDCard = lazy(() => import('@/pages/profile/DigitalIDCard'));

// ==================== Properties ====================
const Properties = lazy(() => import('@/pages/properties/Properties'));
const PropertyDetail = lazy(() => import('@/pages/properties/PropertyDetail'));

// ==================== Investments ====================
const MyInvestments = lazy(() => import('@/pages/investments/MyInvestments'));
const InvestmentDetail = lazy(() => import('@/pages/investments/InvestmentDetail'));
const Portfolio = lazy(() => import('@/pages/investments/Portfolio'));

// ==================== Wallet ====================
const Wallet = lazy(() => import('@/pages/wallet/Wallet'));
const Transactions = lazy(() => import('@/pages/wallet/Transactions'));
const Withdrawal = lazy(() => import('@/pages/wallet/Withdrawal'));
const WithdrawalHistory = lazy(() => import('@/pages/wallet/WithdrawalHistory'));
const BankAccounts = lazy(() => import('@/pages/wallet/BankAccounts'));

// ==================== Commissions ====================
const CommissionOverview = lazy(() => import('@/pages/commissions/CommissionOverview'));
const CommissionHistory = lazy(() => import('@/pages/commissions/CommissionHistory'));

// ==================== Income ====================
const IncomeDashboard = lazy(() => import('@/pages/income/IncomeDashboard'));
const DirectBonus = lazy(() => import('@/pages/income/DirectBonus'));
const LevelBonus = lazy(() => import('@/pages/income/LevelBonus'));
const MatchingBonus = lazy(() => import('@/pages/income/MatchingBonus'));
const ROIBonus = lazy(() => import('@/pages/income/ROIBonus'));
const RewardStatus = lazy(() => import('@/pages/income/RewardStatus'));
const IncomeSummary = lazy(() => import('@/pages/income/IncomeSummary'));

// ==================== Topup ====================
const NewTopup = lazy(() => import('@/pages/topup/NewTopup'));
const TopupHistory = lazy(() => import('@/pages/topup/TopupHistory'));

// ==================== Bonanza ====================
const BonanzaHistory = lazy(() => import('@/pages/bonanza/BonanzaHistory'));
const BonanzaDetail = lazy(() => import('@/pages/bonanza/BonanzaDetail'));
const BonanzaLeaderboard = lazy(() => import('@/pages/bonanza/BonanzaLeaderboard'));

// ==================== E-Pins ====================
const MyEPins = lazy(() => import('@/pages/epin/MyEPins'));

// ==================== Deposits ====================
const MyDeposits = lazy(() => import('@/pages/deposit/MyDeposits'));

// ==================== Withdrawals ====================
const MyWithdrawals = lazy(() => import('@/pages/withdrawals/MyWithdrawals'));

// ==================== Team ====================
const TeamOverview = lazy(() => import('@/pages/team/TeamOverview'));
const TeamMembers = lazy(() => import('@/pages/team/TeamMembers'));
const BinaryTree = lazy(() => import('@/pages/team/BinaryTree'));
const UnilevelTree = lazy(() => import('@/pages/team/UnilevelTree'));
const Referrals = lazy(() => import('@/pages/team/DirectReferrals'));
const TeamReport = lazy(() => import('@/pages/team/TeamReport'));
const TeamDetail = lazy(() => import('@/pages/team/TeamDetail'));
const TreeView = lazy(() => import('@/pages/team/TreeView'));
const TeamLevelTreeView = lazy(() => import('@/pages/team/TeamLevelTreeView'));
const DirectReferral = lazy(() => import('@/pages/team/DirectReferral'));
const TotalDownline = lazy(() => import('@/pages/team/TotalDownline'));
const TeamLevelDownline = lazy(() => import('@/pages/team/TeamLevelDownline'));
const DownlineBusiness = lazy(() => import('@/pages/team/DownlineBusiness'));

// ==================== Rank ====================
const MyRank = lazy(() => import('@/pages/rank/MyRank'));
const RankProgress = lazy(() => import('@/pages/rank/RankProgress'));
const AllRanks = lazy(() => import('@/pages/rank/AllRanks'));
const Achievements = lazy(() => import('@/pages/rank/Achievements'));

// ==================== Referral Tools ====================
const ReferralTools = lazy(() => import('@/pages/referral/ReferralTools'));
const ReferralRegistration = lazy(() => import('@/pages/referral/ReferralRegistration'));

// ==================== KYC ====================
const KYC = lazy(() => import('@/pages/kyc/KYC'));
const DocumentUpload = lazy(() => import('@/pages/kyc/DocumentUpload'));

// ==================== Support ====================
const Tickets = lazy(() => import('@/pages/support/Tickets'));
const TicketDetail = lazy(() => import('@/pages/support/TicketDetail'));
const CreateTicket = lazy(() => import('@/pages/support/CreateTicket'));
const FAQ = lazy(() => import('@/pages/support/FAQ'));

// ==================== Reports ====================
const Reports = lazy(() => import('@/pages/reports/Reports'));

// ==================== Notifications ====================
const Notifications = lazy(() => import('@/pages/notifications/Notifications'));

// ==================== Settings ====================
const Settings = lazy(() => import('@/pages/settings/Settings'));

// ==================== Error Pages ====================
const NotFound = lazy(() => import('@/pages/errors/NotFound'));

/**
 * Routes Configuration Array
 *
 * Organize all application routes with their configurations
 */
export const routesConfig: RouteConfig[] = [
  // ==================== Auth Routes ====================
  {
    path: '/login',
    element: Login,
    layout: 'auth',
    protected: false,
    breadcrumb: 'Login',
    title: 'Login',
  },
  {
    path: '/auth/login',
    element: Login,
    layout: 'auth',
    protected: false,
    breadcrumb: 'Login',
    title: 'Login',
  },
  {
    path: '/register',
    element: RegisterSimple,
    layout: 'blank',
    protected: false,
    breadcrumb: 'Register',
    title: 'Register',
  },
  {
    path: '/auth/register',
    element: RegisterSimple,
    layout: 'blank',
    protected: false,
    breadcrumb: 'Register',
    title: 'Register',
  },
  {
    path: '/register-full',
    element: Register,
    layout: 'auth',
    protected: false,
    breadcrumb: 'Register',
    title: 'Register',
  },
  {
    path: '/otp-verification',
    element: OTPVerificationSimple,
    layout: 'blank',
    protected: false,
    breadcrumb: 'OTP Verification',
    title: 'OTP Verification',
  },
  {
    path: '/auth/otp-verification',
    element: OTPVerificationSimple,
    layout: 'blank',
    protected: false,
    breadcrumb: 'OTP Verification',
    title: 'OTP Verification',
  },
  {
    path: '/otp-verification-full',
    element: OTPVerification,
    layout: 'auth',
    protected: false,
    breadcrumb: 'OTP Verification',
    title: 'OTP Verification',
  },
  {
    path: '/forgot-password',
    element: ForgotPassword,
    layout: 'auth',
    protected: false,
    breadcrumb: 'Forgot Password',
    title: 'Forgot Password',
  },
  {
    path: '/reset-password',
    element: ResetPassword,
    layout: 'auth',
    protected: false,
    breadcrumb: 'Reset Password',
    title: 'Reset Password',
  },

  // ==================== Dashboard Routes ====================
  {
    path: '/',
    element: Dashboard,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Dashboard',
    title: 'Dashboard',
  },
  {
    path: '/dashboard',
    element: Dashboard,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Dashboard',
    title: 'Dashboard',
  },

  // ==================== Profile Routes ====================
  {
    path: '/profile',
    element: Profile,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Profile',
    title: 'My Profile',
  },
  {
    path: '/profile/edit',
    element: EditProfile,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Edit Profile',
    title: 'Edit Profile',
  },
  {
    path: '/profile/id-card',
    element: DigitalIDCard,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Digital ID Card',
    title: 'Digital ID Card',
  },

  // ==================== Properties Routes ====================
  {
    path: '/properties',
    element: Properties,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Properties',
    title: 'Properties',
  },
  {
    path: '/properties/:id',
    element: PropertyDetail,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Property Details',
    title: 'Property Details',
  },

  // ==================== Investments Routes ====================
  {
    path: '/investments',
    element: MyInvestments,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'My Investments',
    title: 'My Investments',
  },
  {
    path: '/investments/:id',
    element: InvestmentDetail,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Investment Details',
    title: 'Investment Details',
  },
  {
    path: '/investments/portfolio',
    element: Portfolio,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Portfolio',
    title: 'Portfolio',
  },

  // ==================== Wallet Routes ====================
  {
    path: '/wallet',
    element: Wallet,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Wallet',
    title: 'My Wallet',
  },
  {
    path: '/wallet/transactions',
    element: Transactions,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Transactions',
    title: 'Transactions',
  },
  {
    path: '/wallet/withdraw',
    element: Withdrawal,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Withdrawal',
    title: 'Withdrawal',
  },
  {
    path: '/wallet/withdrawal',
    element: Withdrawal,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Withdrawal',
    title: 'Withdrawal',
  },
  {
    path: '/wallet/withdrawal-history',
    element: WithdrawalHistory,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Withdrawal History',
    title: 'Withdrawal History',
  },
  {
    path: '/wallet/bank-accounts',
    element: BankAccounts,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Bank Accounts',
    title: 'Bank Accounts',
  },

  // ==================== Commissions Routes ====================
  {
    path: '/commissions',
    element: CommissionOverview,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Commissions',
    title: 'Commissions',
  },
  {
    path: '/commissions/history',
    element: CommissionHistory,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Commission History',
    title: 'Commission History',
  },

  // ==================== Income Routes ====================
  {
    path: '/income',
    element: IncomeDashboard,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Income Dashboard',
    title: 'Income Dashboard',
  },
  {
    path: '/incomes/direct-bonus',
    element: DirectBonus,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Direct Bonus',
    title: 'Direct Bonus',
  },
  {
    path: '/incomes/level-bonus',
    element: LevelBonus,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Level Bonus',
    title: 'Level Bonus',
  },
  {
    path: '/incomes/matching-bonus',
    element: MatchingBonus,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Matching Bonus',
    title: 'Matching Bonus',
  },
  {
    path: '/incomes/roi-bonus',
    element: ROIBonus,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'ROI Bonus',
    title: 'ROI Bonus',
  },
  {
    path: '/incomes/reward-status',
    element: RewardStatus,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Reward Status',
    title: 'Reward Status',
  },

  // ==================== Topup Routes ====================
  {
    path: '/topup',
    element: NewTopup,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'New Topup',
    title: 'New Topup',
  },
  {
    path: '/topup/history',
    element: TopupHistory,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Topup History',
    title: 'Topup History',
  },

 
  {
    path: '/incomes/summary',
    element: IncomeSummary,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Income Summary',
    title: 'Income Summary',
  },

  // ==================== Bonanza Routes ====================
  {
    path: '/bonanza',
    element: BonanzaHistory,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Bonanza Campaigns',
    title: 'Bonanza Campaigns',
  },
  {
    path: '/bonanza/:id',
    element: BonanzaDetail,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Bonanza Details',
    title: 'Bonanza Details',
  },
  {
    path: '/bonanza/:id/leaderboard',
    element: BonanzaLeaderboard,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Bonanza Leaderboard',
    title: 'Bonanza Leaderboard',
  },

  // ==================== E-Pin Routes ====================
  {
    path: '/epins',
    element: MyEPins,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'My E-Pins',
    title: 'My E-Pins',
  },

  // ==================== Deposit Routes ====================
  {
    path: '/deposits',
    element: MyDeposits,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'My Deposits',
    title: 'My Deposits',
  },
  {
    path: '/wallet/deposit',
    element: MyDeposits,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Deposit',
    title: 'Deposit Funds',
  },

  // ==================== Withdrawal Routes ====================
  {
    path: '/withdrawals',
    element: MyWithdrawals,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'My Withdrawals',
    title: 'My Withdrawals',
  },

  // ==================== Team Routes ====================
  {
    path: '/team',
    element: TeamOverview,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Team',
    title: 'My Team',
  },
  {
    path: '/team/members',
    element: TeamMembers,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Team Members',
    title: 'Team Members',
  },
  {
    path: '/team/tree',
    element: BinaryTree,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Binary Tree',
    title: 'Binary Tree',
  },
  {
    path: '/team/binary-tree',
    element: BinaryTree,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Binary Tree',
    title: 'Binary Tree',
  },
  {
    path: '/team/unilevel-tree',
    element: UnilevelTree,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Unilevel Tree',
    title: 'Unilevel Tree',
  },
  {
    path: '/team/referrals',
    element: Referrals,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Referrals',
    title: 'Referrals',
  },
  {
    path: '/team/report',
    element: TeamReport,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Team Report',
    title: 'Team Report',
  },
  {
    path: '/team/members/:id',
    element: TeamDetail,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Member Details',
    title: 'Member Details',
  },
  {
    path: '/team/member/:id',
    element: TeamDetail,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Member Details',
    title: 'Member Details',
  },
  {
    path: '/team/tree-view',
    element: TreeView,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Tree View',
    title: 'Tree View',
  },
  {
    path: '/team/level-tree-view',
    element: TeamLevelTreeView,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Team Level Tree View',
    title: 'Team Level Tree View',
  },
  {
    path: '/team/direct-referral',
    element: DirectReferral,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Direct Referral',
    title: 'Direct Referral',
  },
  {
    path: '/team/total-downline',
    element: TotalDownline,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Total Downline',
    title: 'Total Downline',
  },
  {
    path: '/team/level-downline',
    element: TeamLevelDownline,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Team Level Downline',
    title: 'Team Level Downline',
  },
  {
    path: '/team/downline-business',
    element: DownlineBusiness,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Downline Business',
    title: 'Downline Business',
  },

  // ==================== Rank Routes ====================
  {
    path: '/rank',
    element: MyRank,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'My Rank',
    title: 'My Rank',
  },
  {
    path: '/rank/progress',
    element: RankProgress,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Rank Progress',
    title: 'Rank Progress',
  },
  {
    path: '/rank/all-ranks',
    element: AllRanks,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'All Ranks',
    title: 'All Ranks',
  },
  {
    path: '/rank/achievements',
    element: Achievements,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Achievements',
    title: 'Achievements',
  },

  // ==================== Referral Tools Routes ====================
  {
    path: '/referral-tools',
    element: ReferralTools,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Referral Tools',
    title: 'Referral Tools',
  },
  {
    path: '/referral/registration',
    element: ReferralRegistration,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Direct Registration',
    title: 'Direct Registration',
  },
  {
    path: '/referral/my-referrals',
    element: Referrals, // Reusing existing DirectReferrals component
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'My Referrals',
    title: 'My Referrals',
  },

  // ==================== KYC Routes ====================
  {
    path: '/kyc',
    element: KYC,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'KYC',
    title: 'KYC Verification',
  },
  {
    path: '/kyc/upload',
    element: DocumentUpload,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Upload Documents',
    title: 'Upload KYC Documents',
  },

  // ==================== Support Routes ====================
  {
    path: '/support/tickets',
    element: Tickets,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Support Tickets',
    title: 'Support Tickets',
  },
  {
    path: '/support/tickets/:id',
    element: TicketDetail,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Ticket Details',
    title: 'Ticket Details',
  },
  {
    path: '/support/create-ticket',
    element: CreateTicket,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Create Ticket',
    title: 'Create Ticket',
  },
  {
    path: '/support/faq',
    element: FAQ,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'FAQ',
    title: 'FAQ',
  },

  // ==================== Reports Routes ====================
  {
    path: '/reports',
    element: Reports,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Reports',
    title: 'Reports',
  },

  // ==================== Notifications Routes ====================
  {
    path: '/notifications',
    element: Notifications,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Notifications',
    title: 'Notifications',
  },

  // ==================== Settings Routes ====================
  {
    path: '/settings',
    element: Settings,
    layout: 'dashboard',
    protected: true,
    breadcrumb: 'Settings',
    title: 'Settings',
  },

  // ==================== Error Routes ====================
  {
    path: '*',
    element: NotFound,
    layout: 'blank',
    protected: false,
    breadcrumb: '404',
    title: '404 - Not Found',
  },
];

/**
 * Get route by path
 */
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return routesConfig.find((route) => route.path === path);
};

/**
 * Get all protected routes
 */
export const getProtectedRoutes = (): RouteConfig[] => {
  return routesConfig.filter((route) => route.protected);
};

/**
 * Get all public routes
 */
export const getPublicRoutes = (): RouteConfig[] => {
  return routesConfig.filter((route) => !route.protected);
};

/**
 * Get routes by layout
 */
export const getRoutesByLayout = (layout: 'auth' | 'dashboard' | 'blank'): RouteConfig[] => {
  return routesConfig.filter((route) => route.layout === layout);
};

/**
 * Route groups for sidebar/menu generation
 */
export const routeGroups = {
  main: [
    { path: '/', label: 'Dashboard', icon: 'DashboardIcon' },
  ],
  profile: [
    { path: '/profile', label: 'My Profile', icon: 'PersonIcon' },
  ],
  business: [
    { path: '/properties', label: 'Properties', icon: 'HomeIcon' },
    { path: '/investments', label: 'My Investments', icon: 'TrendingUpIcon' },
  ],
  financial: [
    { path: '/wallet', label: 'Wallet', icon: 'AccountBalanceWalletIcon' },
    { path: '/commissions', label: 'Commissions', icon: 'MonetizationOnIcon' },
  ],
  network: [
    { path: '/team', label: 'My Team', icon: 'PeopleIcon' },
    { path: '/rank', label: 'My Rank', icon: 'EmojiEventsIcon' },
    { path: '/referral-tools', label: 'Referral Tools', icon: 'ShareIcon' },
  ],
  support: [
    { path: '/kyc', label: 'KYC', icon: 'VerifiedUserIcon' },
    { path: '/support/tickets', label: 'Support', icon: 'SupportAgentIcon' },
    { path: '/reports', label: 'Reports', icon: 'DescriptionIcon' },
  ],
  settings: [
    { path: '/notifications', label: 'Notifications', icon: 'NotificationsIcon' },
    { path: '/settings', label: 'Settings', icon: 'SettingsIcon' },
  ],
};

export default routesConfig;
