import 'package:get/get.dart';
import '../presentation/screens/splash/splash_screen.dart';
import '../presentation/screens/onboarding/onboarding_screen.dart';
import '../presentation/screens/auth/login_screen.dart';
import '../presentation/screens/auth/register_screen.dart';
import '../presentation/screens/auth/otp_verification_screen.dart';
import '../presentation/screens/auth/forgot_password_screen.dart';
import '../presentation/screens/auth/reset_password_screen.dart';
import '../presentation/screens/dashboard/dashboard_screen.dart';
import '../presentation/screens/profile/profile_screen.dart';
import '../presentation/screens/profile/edit_profile_screen.dart';
import '../presentation/screens/profile/change_password_screen.dart';
import '../presentation/screens/profile/digital_id_card_screen.dart';
import '../presentation/screens/properties/properties_list_screen.dart';
import '../presentation/screens/properties/property_detail_screen.dart';
import '../presentation/screens/properties/property_filter_screen.dart';
import '../presentation/screens/investments/my_investments_screen.dart';
import '../presentation/screens/investments/investment_detail_screen.dart';
import '../presentation/screens/investments/portfolio_screen.dart';
import '../presentation/screens/investments/pay_installment_screen.dart';
import '../presentation/screens/wallet/wallet_screen.dart';
import '../presentation/screens/wallet/transactions_screen.dart';
import '../presentation/screens/wallet/withdrawal_screen.dart';
import '../presentation/screens/wallet/withdrawal_history_screen.dart';
import '../presentation/screens/wallet/bank_accounts_screen.dart';
import '../presentation/screens/wallet/add_bank_account_screen.dart';
import '../presentation/screens/commissions/commission_screen.dart';
import '../presentation/screens/commissions/commission_history_screen.dart';
import '../presentation/screens/team/team_screen.dart';
import '../presentation/screens/team/binary_tree_screen.dart';
import '../presentation/screens/team/unilevel_tree_screen.dart';
import '../presentation/screens/team/direct_referrals_screen.dart';
import '../presentation/screens/team/team_report_screen.dart';
import '../presentation/screens/rank/my_rank_screen.dart';
import '../presentation/screens/rank/rank_progress_screen.dart';
import '../presentation/screens/rank/all_ranks_screen.dart';
import '../presentation/screens/rank/achievements_screen.dart';
import '../presentation/screens/referral/referral_screen.dart';
import '../presentation/screens/kyc/kyc_screen.dart';
import '../presentation/screens/kyc/document_upload_screen.dart';
import '../presentation/screens/support/tickets_screen.dart';
import '../presentation/screens/support/ticket_detail_screen.dart';
import '../presentation/screens/support/create_ticket_screen.dart';
import '../presentation/screens/support/faq_screen.dart';
import '../presentation/screens/notifications/notifications_screen.dart';
import '../presentation/screens/settings/settings_screen.dart';
import '../presentation/screens/settings/notification_settings_screen.dart';

class AppRoutes {
  // Authentication Routes
  static const String splash = '/splash';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String otpVerification = '/otp-verification';
  static const String forgotPassword = '/forgot-password';
  static const String resetPassword = '/reset-password';

  // Main App Routes
  static const String dashboard = '/dashboard';
  static const String profile = '/profile';
  static const String editProfile = '/edit-profile';
  static const String changePassword = '/change-password';
  static const String digitalIdCard = '/digital-id-card';

  // Properties Routes
  static const String propertiesList = '/properties';
  static const String propertyDetail = '/property-detail';
  static const String propertyFilter = '/property-filter';

  // Investments Routes
  static const String myInvestments = '/my-investments';
  static const String investmentDetail = '/investment-detail';
  static const String portfolio = '/portfolio';
  static const String payInstallment = '/pay-installment';

  // Wallet Routes
  static const String wallet = '/wallet';
  static const String transactions = '/transactions';
  static const String withdrawal = '/withdrawal';
  static const String withdrawalHistory = '/withdrawal-history';
  static const String bankAccounts = '/bank-accounts';
  static const String addBankAccount = '/add-bank-account';

  // Commission Routes
  static const String commission = '/commission';
  static const String commissionHistory = '/commission-history';

  // Team Routes
  static const String team = '/team';
  static const String binaryTree = '/binary-tree';
  static const String unilevelTree = '/unilevel-tree';
  static const String directReferrals = '/direct-referrals';
  static const String teamReport = '/team-report';

  // Rank Routes
  static const String myRank = '/my-rank';
  static const String rankProgress = '/rank-progress';
  static const String allRanks = '/all-ranks';
  static const String achievements = '/achievements';

  // Referral Routes
  static const String referral = '/referral';

  // KYC Routes
  static const String kyc = '/kyc';
  static const String documentUpload = '/document-upload';

  // Support Routes
  static const String tickets = '/tickets';
  static const String ticketDetail = '/ticket-detail';
  static const String createTicket = '/create-ticket';
  static const String faq = '/faq';

  // Notifications Routes
  static const String notifications = '/notifications';

  // Settings Routes
  static const String settings = '/settings';
  static const String notificationSettings = '/notification-settings';

  // Route List
  static final routes = [
    // Authentication Routes
    GetPage(
      name: splash,
      page: () => const SplashScreen(),
      transition: Transition.fade,
    ),
    GetPage(
      name: onboarding,
      page: () => const OnboardingScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: login,
      page: () => const LoginScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: register,
      page: () => const RegisterScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: otpVerification,
      page: () => OtpVerificationScreen(
        emailOrMobile: Get.arguments?['emailOrMobile'] ?? '',
        isRegistration: Get.arguments?['isRegistration'] ?? false,
      ),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: forgotPassword,
      page: () => const ForgotPasswordScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: resetPassword,
      page: () => ResetPasswordScreen(
        token: Get.arguments?['token'] ?? '',
      ),
      transition: Transition.rightToLeft,
    ),

    // Main App Routes
    GetPage(
      name: dashboard,
      page: () => const DashboardScreen(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: profile,
      page: () => const ProfileScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: editProfile,
      page: () => const EditProfileScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: changePassword,
      page: () => const ChangePasswordScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: digitalIdCard,
      page: () => const DigitalIdCardScreen(),
      transition: Transition.rightToLeft,
    ),

    // Properties Routes
    GetPage(
      name: propertiesList,
      page: () => const PropertiesListScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: propertyDetail,
      page: () => PropertyDetailScreen(
        propertyId: Get.arguments?['propertyId'] ?? '',
      ),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: propertyFilter,
      page: () => PropertyFilterScreen(
        onApply: Get.arguments?['onApply'] ?? (filters) {},
      ),
      transition: Transition.downToUp,
    ),

    // Investments Routes
    GetPage(
      name: myInvestments,
      page: () => const MyInvestmentsScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: investmentDetail,
      page: () => InvestmentDetailScreen(
        investmentId: Get.arguments?['investmentId'] ?? '',
      ),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: portfolio,
      page: () => const PortfolioScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: payInstallment,
      page: () => PayInstallmentScreen(
        investmentId: Get.arguments?['investmentId'] ?? '',
        installment: Get.arguments?['installment'],
      ),
      transition: Transition.rightToLeft,
    ),

    // Wallet Routes
    GetPage(
      name: wallet,
      page: () => const WalletScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: transactions,
      page: () => const TransactionsScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: withdrawal,
      page: () => const WithdrawalScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: withdrawalHistory,
      page: () => const WithdrawalHistoryScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: bankAccounts,
      page: () => const BankAccountsScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: addBankAccount,
      page: () => const AddBankAccountScreen(),
      transition: Transition.rightToLeft,
    ),

    // Commission Routes
    GetPage(
      name: commission,
      page: () => const CommissionScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: commissionHistory,
      page: () => const CommissionHistoryScreen(),
      transition: Transition.rightToLeft,
    ),

    // Team Routes
    GetPage(
      name: team,
      page: () => const TeamScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: binaryTree,
      page: () => const BinaryTreeScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: unilevelTree,
      page: () => const UnilevelTreeScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: directReferrals,
      page: () => const DirectReferralsScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: teamReport,
      page: () => const TeamReportScreen(),
      transition: Transition.rightToLeft,
    ),

    // Rank Routes
    GetPage(
      name: myRank,
      page: () => const MyRankScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: rankProgress,
      page: () => const RankProgressScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: allRanks,
      page: () => const AllRanksScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: achievements,
      page: () => const AchievementsScreen(),
      transition: Transition.rightToLeft,
    ),

    // Referral Routes
    GetPage(
      name: referral,
      page: () => const ReferralScreen(),
      transition: Transition.rightToLeft,
    ),

    // KYC Routes
    GetPage(
      name: kyc,
      page: () => const KycScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: documentUpload,
      page: () => const DocumentUploadScreen(),
      transition: Transition.rightToLeft,
    ),

    // Support Routes
    GetPage(
      name: tickets,
      page: () => const TicketsScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: ticketDetail,
      page: () => TicketDetailScreen(
        ticketId: Get.arguments?['ticketId'] ?? '',
      ),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: createTicket,
      page: () => const CreateTicketScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: faq,
      page: () => const FaqScreen(),
      transition: Transition.rightToLeft,
    ),

    // Notifications Routes
    GetPage(
      name: notifications,
      page: () => const NotificationsScreen(),
      transition: Transition.rightToLeft,
    ),

    // Settings Routes
    GetPage(
      name: settings,
      page: () => const SettingsScreen(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: notificationSettings,
      page: () => const NotificationSettingsScreen(),
      transition: Transition.rightToLeft,
    ),
  ];
}
