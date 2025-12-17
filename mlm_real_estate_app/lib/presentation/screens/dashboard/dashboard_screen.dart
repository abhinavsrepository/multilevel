import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
// COMMENTED OUT: carousel_slider has naming conflict with Flutter's built-in MaterialCarousel
// import 'package:carousel_slider/carousel_slider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../data/providers/auth_provider.dart';
import '../../../data/providers/dashboard_provider.dart';
import '../../../data/models/dashboard_model.dart';
import 'widgets/stats_card_widget.dart';
import 'widgets/quick_action_widget.dart';
import 'widgets/activity_card_widget.dart';
import 'widgets/announcement_widget.dart';
import 'widgets/chart_widget.dart';

/// Dashboard screen - Main home screen of the application
///
/// Displays user stats, quick actions, recent activities, announcements, and earnings chart
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadDashboardData();
    });
  }

  Future<void> _loadDashboardData() async {
    await context.read<DashboardProvider>().getDashboardData();
  }

  Future<void> _handleRefresh() async {
    await _loadDashboardData();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = context.watch<AuthProvider>();
    final dashboardProvider = context.watch<DashboardProvider>();
    final userName = authProvider.user?.fullName.split(' ').first ?? 'User';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: _buildBody(theme, userName, dashboardProvider),
    );
  }

  Widget _buildBody(ThemeData theme, String userName, DashboardProvider provider) {
    if (provider.isLoading && provider.dashboardData == null) {
      return const Center(child: LoadingWidget());
    }

    if (provider.errorMessage != null && provider.dashboardData == null) {
      return Center(
        child: custom_error.CustomErrorWidget(
          message: provider.errorMessage!,
          onRetry: _loadDashboardData,
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _handleRefresh,
      color: AppColors.primary,
      child: CustomScrollView(
        slivers: [
          _buildAppBar(theme, userName),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16.0),
                _buildStatsSection(provider.dashboardData),
                const SizedBox(height: 24.0),
                _buildQuickActionsSection(),
                const SizedBox(height: 24.0),
                _buildEarningsChart(),
                const SizedBox(height: 24.0),
                _buildAnnouncementsSection(provider.dashboardData),
                const SizedBox(height: 24.0),
                _buildRecentActivitiesSection(provider.dashboardData),
                const SizedBox(height: 24.0),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar(ThemeData theme, String userName) {
    return SliverAppBar(
      floating: true,
      snap: true,
      backgroundColor: AppColors.surface,
      elevation: 0,
      titleSpacing: 16.0,
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Hello, $userName!',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Welcome back to your dashboard',
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_outlined),
          color: AppColors.textPrimary,
          onPressed: () {
            Navigator.pushNamed(context, '/notifications');
          },
        ),
        IconButton(
          icon: const Icon(Icons.qr_code_scanner),
          color: AppColors.textPrimary,
          onPressed: () {
            Navigator.pushNamed(context, '/qr-scanner');
          },
        ),
        const SizedBox(width: 8.0),
      ],
    );
  }

  Widget _buildStatsSection(DashboardModel? data) {
    if (data == null) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: GridView.count(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 2,
        mainAxisSpacing: 12.0,
        crossAxisSpacing: 12.0,
        childAspectRatio: 1.5,
        children: [
          StatsCardWidget(
            icon: Icons.account_balance_wallet,
            title: 'Total Earnings',
            value: '₹${data.totalEarnings.toStringAsFixed(0)}',
            iconColor: AppColors.success,
            percentageChange: 12.5,
            onTap: () => Navigator.pushNamed(context, '/wallet'),
          ),
          StatsCardWidget(
            icon: Icons.trending_up,
            title: 'Investment',
            value: '₹${data.totalInvestment.toStringAsFixed(0)}',
            iconColor: AppColors.primary,
            percentageChange: 8.3,
            onTap: () => Navigator.pushNamed(context, '/investments'),
          ),
          StatsCardWidget(
            icon: Icons.people,
            title: 'Team Size',
            value: '${data.teamSize}',
            iconColor: AppColors.info,
            percentageChange: 15.0,
            onTap: () => Navigator.pushNamed(context, '/team'),
          ),
          StatsCardWidget(
            icon: Icons.monetization_on,
            title: 'Commission',
            value: '₹${data.totalCommission.toStringAsFixed(0)}',
            iconColor: AppColors.secondary,
            percentageChange: 5.7,
            onTap: () => Navigator.pushNamed(context, '/commissions'),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Text(
            'Quick Actions',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
          ),
        ),
        const SizedBox(height: 12.0),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            children: [
              Expanded(
                child: QuickActionWidget(
                  icon: Icons.add_business,
                  label: 'Invest Now',
                  gradient: AppColors.primaryGradient,
                  onTap: () => Navigator.pushNamed(context, '/properties'),
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: QuickActionWidget(
                  icon: Icons.group_add,
                  label: 'Refer Friend',
                  gradient: AppColors.successGradient,
                  onTap: () => Navigator.pushNamed(context, '/referral'),
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: QuickActionWidget(
                  icon: Icons.payment,
                  label: 'Withdraw',
                  gradient: AppColors.warningGradient,
                  onTap: () => Navigator.pushNamed(context, '/wallet/withdraw'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEarningsChart() {
    final monthlyData = [
      25000.0,
      30000.0,
      28000.0,
      35000.0,
      40000.0,
      45000.0,
    ];
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: ChartWidget(
        monthlyData: monthlyData,
        months: months,
        title: 'Monthly Earnings Overview',
      ),
    );
  }

  Widget _buildAnnouncementsSection(DashboardModel? data) {
    if (data == null || data.announcements.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Announcements',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/announcements');
                },
                child: Text(
                  'View All',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12.0),
        // REPLACED CarouselSlider with horizontal ListView due to package conflict
        SizedBox(
          height: 200.0,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12.0),
            itemCount: data.announcements.length,
            itemBuilder: (context, index) {
              return Container(
                width: MediaQuery.of(context).size.width * 0.85,
                margin: const EdgeInsets.symmetric(horizontal: 4.0),
                child: AnnouncementWidget(
                  announcement: data.announcements[index],
                  onTap: () {
                    _showAnnouncementDetails(data.announcements[index]);
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildRecentActivitiesSection(DashboardModel? data) {
    if (data == null || data.recentActivities.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recent Activities',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/activities');
                },
                child: Text(
                  'View All',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12.0),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          itemCount: data.recentActivities.length,
          separatorBuilder: (context, index) => const SizedBox(height: 8.0),
          itemBuilder: (context, index) {
            return ActivityCardWidget(
              activity: data.recentActivities[index],
              onTap: () {
                _showActivityDetails(data.recentActivities[index]);
              },
            );
          },
        ),
      ],
    );
  }

  void _showAnnouncementDetails(Announcement announcement) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24.0),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    announcement.title,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16.0),
            Text(
              announcement.content,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.6,
                  ),
            ),
            const SizedBox(height: 24.0),
          ],
        ),
      ),
    );
  }

  void _showActivityDetails(RecentActivity activity) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24.0),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    activity.description,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16.0),
            if (activity.amount != null)
              Text(
                'Amount: ₹${activity.amount!.abs().toStringAsFixed(2)}',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
            const SizedBox(height: 24.0),
          ],
        ),
      ),
    );
  }
}
