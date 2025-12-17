export const routes = {
  login: '/login',
  forgotPassword: '/forgot-password',
  twoFactorAuth: '/2fa',

  dashboard: '/dashboard',

  users: '/users',
  userDetail: '/users/:id',
  addUser: '/users/add',
  editUser: '/users/edit/:id',
  genealogyTree: '/users/tree/:id',

  properties: '/properties',
  propertyDetail: '/properties/:id',
  addProperty: '/properties/add',
  editProperty: '/properties/edit/:id',
  propertyInvestors: '/properties/:id/investors',

  investments: '/investments',
  investmentDetail: '/investments/:id',
  pendingInvestments: '/investments/pending',

  commissions: '/commissions',
  commissionDetail: '/commissions/:id',
  commissionSettings: '/commissions/settings',

  payouts: '/payouts',
  pendingPayouts: '/payouts/pending',
  payoutDetail: '/payouts/:id',
  batchPayouts: '/payouts/batch',

  kyc: '/kyc',
  pendingKYC: '/kyc/pending',
  kycDetail: '/kyc/:id',

  notifications: '/notifications',
  sendBroadcast: '/notifications/send',
  notificationHistory: '/notifications/history',
  pushSettings: '/notifications/settings',

  support: '/support',
  ticketDetail: '/support/:id',
  ticketTemplates: '/support/templates',

  reports: '/reports',
  advancedAnalytics: '/reports/analytics',

  ranks: '/ranks',
  rankSettings: '/ranks/settings',
  rankAchievements: '/ranks/achievements',

  settings: '/settings',
  generalSettings: '/settings/general',
  adminUsers: '/settings/admins',
  emailTemplates: '/settings/email-templates',

  analytics: '/analytics',
  propertyAnalytics: '/analytics/properties',
  userAnalytics: '/analytics/users',
  financialAnalytics: '/analytics/financial',

  auditLogs: '/audit-logs',

  monitoring: '/monitoring',
  liveMonitor: '/monitoring/live',

  backup: '/backup',

  profile: '/profile',
};
