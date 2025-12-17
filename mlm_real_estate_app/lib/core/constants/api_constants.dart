/// API Constants for MLM Real Estate Application
/// Contains all API endpoint definitions organized by module
library;

class ApiConstants {
  ApiConstants._();

  /// Base URL for the API
  static const String baseUrl = 'https://api.mlmrealestate.com/v1';

  /// API version
  static const String apiVersion = 'v1';

  // ============================================================================
  // AUTHENTICATION ENDPOINTS
  // ============================================================================

  /// Authentication base path
  static const String authBase = '/auth';

  /// User login endpoint
  static const String login = '$authBase/login';

  /// User registration endpoint
  static const String register = '$authBase/register';

  /// OTP verification endpoint
  static const String verifyOtp = '$authBase/verify-otp';

  /// Resend OTP endpoint
  static const String resendOtp = '$authBase/resend-otp';

  /// Forgot password endpoint
  static const String forgotPassword = '$authBase/forgot-password';

  /// Reset password endpoint
  static const String resetPassword = '$authBase/reset-password';

  /// User logout endpoint
  static const String logout = '$authBase/logout';

  /// Refresh authentication token endpoint
  static const String refreshToken = '$authBase/refresh-token';

  /// Verify email endpoint
  static const String verifyEmail = '$authBase/verify-email';

  /// Check username availability
  static const String checkUsername = '$authBase/check-username';

  /// Check email availability
  static const String checkEmail = '$authBase/check-email';

  /// Validate sponsor endpoint
  static const String validateSponsor = '$authBase/validate-sponsor/{id}';

  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  /// User base path
  static const String userBase = '/user';

  /// Get user profile endpoint
  static const String profile = '$userBase/profile';

  /// Update user profile endpoint
  static const String updateProfile = '$userBase/update-profile';

  /// Change password endpoint
  static const String changePassword = '$userBase/change-password';

  /// Upload user avatar endpoint
  static const String uploadAvatar = '$userBase/upload-avatar';

  /// Get user settings endpoint
  static const String settings = '$userBase/settings';

  /// Update user settings endpoint
  static const String updateSettings = '$userBase/update-settings';

  /// Delete user account endpoint
  static const String deleteAccount = '$userBase/delete-account';

  /// Get user referral link
  static const String referralLink = '$userBase/referral-link';

  /// Get user activity log
  static const String activityLog = '$userBase/activity-log';

  // ============================================================================
  // DASHBOARD ENDPOINTS
  // ============================================================================

  /// Dashboard base path
  static const String dashboardBase = '/dashboard';

  /// Get dashboard data endpoint
  static const String dashboard = '/users/dashboard';

  /// Get dashboard statistics endpoint
  static const String stats = '$dashboardBase/stats';

  /// Get recent activities endpoint
  static const String recentActivities = '$dashboardBase/recent-activities';

  /// Get announcements endpoint
  static const String announcements = '$dashboardBase/announcements';

  /// Get dashboard summary endpoint
  static const String dashboardSummary = '$dashboardBase/summary';

  /// Get earnings overview
  static const String earningsOverview = '$dashboardBase/earnings-overview';

  /// Get team overview
  static const String teamOverview = '$dashboardBase/team-overview';

  /// Get investment overview
  static const String investmentOverview = '$dashboardBase/investment-overview';

  // ============================================================================
  // PROPERTY ENDPOINTS
  // ============================================================================

  /// Property base path
  static const String propertyBase = '/properties';

  /// Get property list endpoint
  static const String propertyList = propertyBase;

  /// Get property detail endpoint (append property ID)
  static const String propertyDetail = '$propertyBase/{id}';

  /// Search properties endpoint
  static const String searchProperty = '$propertyBase/search';

  /// Filter properties endpoint
  static const String filterProperty = '$propertyBase/filter';

  /// Get property categories endpoint
  static const String propertyCategories = '$propertyBase/categories';

  /// Get featured properties endpoint
  static const String featuredProperties = '$propertyBase/featured';

  /// Get trending properties endpoint
  static const String trendingProperties = '$propertyBase/trending';

  /// Get property amenities endpoint
  static const String propertyAmenities = '$propertyBase/amenities';

  /// Get property images endpoint
  static const String propertyImages = '$propertyBase/{id}/images';

  /// Get property documents endpoint
  static const String propertyDocuments = '$propertyBase/{id}/documents';

  /// Get property reviews endpoint
  static const String propertyReviews = '$propertyBase/{id}/reviews';

  /// Add property to favorites
  static const String addToFavorites = '$propertyBase/{id}/favorite';

  /// Get favorite properties
  static const String favoriteProperties = '$propertyBase/favorites';

  // ============================================================================
  // INVESTMENT ENDPOINTS
  // ============================================================================

  /// Investment base path
  static const String investmentBase = '/investments';

  /// Get investment list endpoint
  static const String investmentList = investmentBase;

  /// Create new investment endpoint
  static const String createInvestment = '$investmentBase/create';

  /// Get investment detail endpoint (append investment ID)
  static const String investmentDetail = '$investmentBase/{id}';

  /// Get investment installments endpoint
  static const String installments = '$investmentBase/{id}/installments';

  /// Pay investment installment endpoint
  static const String payInstallment = '$investmentBase/{id}/pay-installment';

  /// Get investment summary endpoint
  static const String investmentSummary = '$investmentBase/summary';

  /// Get investment history endpoint
  static const String investmentHistory = '$investmentBase/history';

  /// Cancel investment endpoint
  static const String cancelInvestment = '$investmentBase/{id}/cancel';

  /// Get investment returns endpoint
  static const String investmentReturns = '$investmentBase/{id}/returns';

  /// Get investment documents endpoint
  static const String investmentDocuments = '$investmentBase/{id}/documents';

  /// Download investment receipt
  static const String downloadReceipt = '$investmentBase/{id}/receipt';

  // ============================================================================
  // WALLET ENDPOINTS
  // ============================================================================

  /// Wallet base path
  static const String walletBase = '/wallet';

  /// Get wallet balance endpoint
  static const String walletBalance = '$walletBase/balance';

  /// Get wallet transactions endpoint
  static const String walletTransactions = '$walletBase/transactions';

  /// Withdraw from wallet endpoint
  static const String withdraw = '$walletBase/withdraw';

  /// Get withdrawal history endpoint
  static const String withdrawalHistory = '$walletBase/withdrawal-history';

  /// Add funds to wallet endpoint
  static const String addFunds = '$walletBase/add-funds';

  /// Transfer funds endpoint
  static const String transferFunds = '$walletBase/transfer';

  /// Get wallet statement endpoint
  static const String walletStatement = '$walletBase/statement';

  /// Get transaction detail endpoint
  static const String transactionDetail = '$walletBase/transactions/{id}';

  /// Cancel withdrawal request
  static const String cancelWithdrawal = '$walletBase/withdrawal/{id}/cancel';

  // ============================================================================
  // COMMISSION ENDPOINTS
  // ============================================================================

  /// Commission base path
  static const String commissionBase = '/commissions';

  /// Get commission earnings endpoint
  static const String commissionEarnings = '$commissionBase/earnings';

  /// Get commission history endpoint
  static const String commissionHistory = '$commissionBase/history';

  /// Get commission types endpoint
  static const String commissionTypes = '$commissionBase/types';

  /// Withdraw commission endpoint
  static const String withdrawCommission = '$commissionBase/withdraw';

  /// Get commission summary endpoint
  static const String commissionSummary = '$commissionBase/summary';

  /// Get direct referral commissions
  static const String directCommissions = '$commissionBase/direct';

  /// Get binary commissions
  static const String binaryCommissions = '$commissionBase/binary';

  /// Get unilevel commissions
  static const String unilevelCommissions = '$commissionBase/unilevel';

  /// Get matching bonus commissions
  static const String matchingBonus = '$commissionBase/matching-bonus';

  /// Get rank achievement bonus
  static const String rankBonus = '$commissionBase/rank-bonus';

  /// Get commission breakdown
  static const String commissionBreakdown = '$commissionBase/breakdown';

  // ============================================================================
  // PAYOUT ENDPOINTS
  // ============================================================================

  /// Payout base path
  static const String payoutBase = '/payouts';

  /// Get payout list endpoint
  static const String payoutList = payoutBase;

  /// Request payout endpoint
  static const String requestPayout = '$payoutBase/request';

  /// Get payout history endpoint
  static const String payoutHistory = '$payoutBase/history';

  /// Cancel payout request endpoint
  static const String cancelPayout = '$payoutBase/{id}/cancel';

  /// Get payout detail endpoint
  static const String payoutDetail = '$payoutBase/{id}';

  /// Get pending payouts
  static const String pendingPayouts = '$payoutBase/pending';

  /// Get completed payouts
  static const String completedPayouts = '$payoutBase/completed';

  /// Get payout settings
  static const String payoutSettings = '$payoutBase/settings';

  /// Update payout settings
  static const String updatePayoutSettings = '$payoutBase/settings/update';

  // ============================================================================
  // TEAM/TREE ENDPOINTS
  // ============================================================================

  /// Team base path
  static const String teamBase = '/team';

  /// Get binary tree endpoint
  static const String binaryTree = '$teamBase/binary-tree';

  /// Get unilevel tree endpoint
  static const String unilevelTree = '$teamBase/unilevel-tree';

  /// Get direct referrals endpoint
  static const String directReferrals = '$teamBase/direct-referrals';

  /// Get team statistics endpoint
  static const String teamStats = '$teamBase/stats';

  /// Get team members list
  static const String teamMembers = '$teamBase/members';

  /// Get team member detail
  static const String teamMemberDetail = '$teamBase/members/{id}';

  /// Get downline list
  static const String downline = '$teamBase/downline';

  /// Get upline list
  static const String upline = '$teamBase/upline';

  /// Get team growth analytics
  static const String teamGrowth = '$teamBase/growth';

  /// Get team performance
  static const String teamPerformance = '$teamBase/performance';

  /// Get team volume
  static const String teamVolume = '$teamBase/volume';

  /// Get placement options
  static const String placementOptions = '$teamBase/placement-options';

  // ============================================================================
  // RANK ENDPOINTS
  // ============================================================================

  /// Rank base path
  static const String rankBase = '/ranks';

  /// Get current rank endpoint
  static const String currentRank = '$rankBase/current';

  /// Get rank history endpoint
  static const String rankHistory = '$rankBase/history';

  /// Get all ranks endpoint
  static const String allRanks = '$rankBase/all';

  /// Get rank achievements endpoint
  static const String achievements = '$rankBase/achievements';

  /// Get rank requirements endpoint
  static const String rankRequirements = '$rankBase/requirements';

  /// Get rank progress endpoint
  static const String rankProgress = '$rankBase/progress';

  /// Get rank benefits endpoint
  static const String rankBenefits = '$rankBase/benefits';

  /// Get top performers by rank
  static const String topPerformers = '$rankBase/top-performers';

  // ============================================================================
  // KYC ENDPOINTS
  // ============================================================================

  /// KYC base path
  static const String kycBase = '/kyc';

  /// Get KYC status endpoint
  static const String kycStatus = '$kycBase/status';

  /// Upload KYC document endpoint
  static const String uploadDocument = '$kycBase/upload-document';

  /// Verify KYC endpoint
  static const String verifyKyc = '$kycBase/verify';

  /// Get KYC requirements
  static const String kycRequirements = '$kycBase/requirements';

  /// Submit KYC for verification
  static const String submitKyc = '$kycBase/submit';

  /// Get KYC history
  static const String kycHistory = '$kycBase/history';

  /// Delete KYC document
  static const String deleteDocument = '$kycBase/document/{id}/delete';

  /// Get document types
  static const String documentTypes = '$kycBase/document-types';

  // ============================================================================
  // BANK ENDPOINTS
  // ============================================================================

  /// Bank base path
  static const String bankBase = '/bank-accounts';

  /// Get bank account list endpoint
  static const String bankList = bankBase;

  /// Add bank account endpoint
  static const String addBank = '$bankBase/add';

  /// Update bank account endpoint
  static const String updateBank = '$bankBase/{id}/update';

  /// Delete bank account endpoint
  static const String deleteBank = '$bankBase/{id}/delete';

  /// Set primary bank account endpoint
  static const String setPrimaryBank = '$bankBase/{id}/set-primary';

  /// Get bank account detail
  static const String bankDetail = '$bankBase/{id}';

  /// Verify bank account
  static const String verifyBank = '$bankBase/{id}/verify';

  /// Get supported banks
  static const String supportedBanks = '$bankBase/supported-banks';

  // Aliases for backward compatibility
  static const String bankAccounts = bankList;
  static const String addBankAccount = addBank;
  static const String updateBankAccount = updateBank;
  static const String deleteBankAccount = deleteBank;
  static const String setPrimaryBankAccount = setPrimaryBank;

  // ============================================================================
  // TICKET/SUPPORT ENDPOINTS
  // ============================================================================

  /// Ticket base path
  static const String ticketBase = '/tickets';

  /// Get ticket list endpoint
  static const String ticketList = ticketBase;

  /// Create ticket endpoint
  static const String createTicket = '$ticketBase/create';

  /// Get ticket detail endpoint
  static const String ticketDetail = '$ticketBase/{id}';

  /// Reply to ticket endpoint
  static const String replyTicket = '$ticketBase/{id}/reply';

  /// Close ticket endpoint
  static const String closeTicket = '$ticketBase/{id}/close';

  /// Get ticket categories
  static const String ticketCategories = '$ticketBase/categories';

  /// Get ticket priorities
  static const String ticketPriorities = '$ticketBase/priorities';

  /// Upload ticket attachment
  static const String uploadAttachment = '$ticketBase/{id}/upload';

  /// Get open tickets
  static const String openTickets = '$ticketBase/open';

  /// Get closed tickets
  static const String closedTickets = '$ticketBase/closed';

  /// Rate ticket resolution
  static const String rateTicket = '$ticketBase/{id}/rate';

  // ============================================================================
  // NOTIFICATION ENDPOINTS
  // ============================================================================

  /// Notification base path
  static const String notificationBase = '/notifications';

  /// Get notification list endpoint
  static const String notificationList = notificationBase;

  /// Mark notification as read endpoint
  static const String markRead = '$notificationBase/{id}/mark-read';

  /// Mark all notifications as read endpoint
  static const String markAllRead = '$notificationBase/mark-all-read';

  /// Get notification settings endpoint
  static const String notificationSettings = '$notificationBase/settings';

  /// Update notification settings endpoint
  static const String updateNotificationSettings = '$notificationBase/settings/update';

  /// Delete notification
  static const String deleteNotification = '$notificationBase/{id}/delete';

  /// Delete all notifications
  static const String deleteAllNotifications = '$notificationBase/delete-all';

  /// Get unread count
  static const String unreadCount = '$notificationBase/unread-count';

  /// Get notification preferences
  static const String notificationPreferences = '$notificationBase/preferences';

  /// Register device for push notifications
  static const String registerDevice = '$notificationBase/register-device';

  /// Unregister device from push notifications
  static const String unregisterDevice = '$notificationBase/unregister-device';

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /// Replace path parameter with actual value
  /// Example: replacePathParam(propertyDetail, 'id', '123')
  static String replacePathParam(String path, String param, String value) {
    return path.replaceAll('{$param}', value);
  }

  /// Build full URL with base URL
  static String buildUrl(String endpoint) {
    return '$baseUrl$endpoint';
  }

  /// Build URL with query parameters
  static String buildUrlWithParams(String endpoint, Map<String, dynamic> params) {
    final uri = Uri.parse('$baseUrl$endpoint');
    final newUri = uri.replace(queryParameters: params.map(
      (key, value) => MapEntry(key, value.toString()),
    ));
    return newUri.toString();
  }
}
