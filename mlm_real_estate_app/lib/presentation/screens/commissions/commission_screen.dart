import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../data/providers/commission_provider.dart';
import '../../../core/utils/currency_utils.dart';
import 'widgets/commission_card_widget.dart';
import 'widgets/commission_chart_widget.dart';
import 'widgets/commission_breakdown_widget.dart';

/// Commission screen - Main commission dashboard
///
/// Displays total earnings, commission breakdown, chart, and recent commissions
class CommissionScreen extends StatefulWidget {
  const CommissionScreen({super.key});

  @override
  State<CommissionScreen> createState() => _CommissionScreenState();
}

class _CommissionScreenState extends State<CommissionScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadCommissionData();
    });
  }

  Future<void> _loadCommissionData() async {
    final commissionProvider = context.read<CommissionProvider>();
    await Future.wait([
      commissionProvider.getEarnings(),
      commissionProvider.getCommissionHistory(refresh: true),
    ]);
  }

  Future<void> _handleRefresh() async {
    await context.read<CommissionProvider>().refresh();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Commissions'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {
              Navigator.pushNamed(context, '/commissions/history');
            },
            tooltip: 'Commission History',
          ),
        ],
      ),
      body: Consumer<CommissionProvider>(
        builder: (context, commissionProvider, child) {
          if (commissionProvider.isLoading &&
              commissionProvider.earnings == null) {
            return const Center(child: LoadingWidget());
          }

          if (commissionProvider.errorMessage != null &&
              commissionProvider.earnings == null) {
            return Center(
              child: custom_error.CustomErrorWidget(
                message: commissionProvider.errorMessage!,
                onRetry: _loadCommissionData,
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _handleRefresh,
            color: AppColors.primary,
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 16.0),
                      _buildTotalEarningsCard(commissionProvider),
                      const SizedBox(height: 24.0),
                      _buildCommissionBreakdown(commissionProvider),
                      const SizedBox(height: 24.0),
                      _buildCommissionChart(commissionProvider),
                      const SizedBox(height: 24.0),
                      _buildRecentCommissions(theme, commissionProvider),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildTotalEarningsCard(CommissionProvider commissionProvider) {
    final earnings = commissionProvider.earnings ?? {};
    final totalEarnings = (earnings['totalEarnings'] as num?)?.toDouble() ?? 0.0;
    final availableEarnings = (earnings['availableEarnings'] as num?)?.toDouble() ?? 0.0;
    final withdrawnEarnings = (earnings['withdrawnEarnings'] as num?)?.toDouble() ?? 0.0;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Container(
        padding: const EdgeInsets.all(24.0),
        decoration: BoxDecoration(
          gradient: AppColors.primaryGradient,
          borderRadius: BorderRadius.circular(16.0),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.3),
              blurRadius: 12.0,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12.0),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                  child: const Icon(
                    Icons.monetization_on,
                    color: Colors.white,
                    size: 32.0,
                  ),
                ),
                const SizedBox(width: 16.0),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total Earnings',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.white.withOpacity(0.9),
                            ),
                      ),
                      const SizedBox(height: 4.0),
                      Text(
                        CurrencyUtils.formatINR(totalEarnings),
                        style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20.0),
            const Divider(color: Colors.white24),
            const SizedBox(height: 16.0),
            Row(
              children: [
                Expanded(
                  child: _buildEarningsStat(
                    'Available',
                    CurrencyUtils.formatINR(availableEarnings),
                    Icons.account_balance_wallet,
                  ),
                ),
                Container(
                  width: 1.0,
                  height: 40.0,
                  color: Colors.white24,
                ),
                Expanded(
                  child: _buildEarningsStat(
                    'Withdrawn',
                    CurrencyUtils.formatINR(withdrawnEarnings),
                    Icons.arrow_upward,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16.0),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/wallet/withdraw');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 12.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
                child: const Text(
                  'Withdraw Earnings',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEarningsStat(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white70, size: 20.0),
        const SizedBox(height: 4.0),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.white70,
              ),
        ),
        const SizedBox(height: 2.0),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
        ),
      ],
    );
  }

  Widget _buildCommissionBreakdown(CommissionProvider commissionProvider) {
    final earnings = commissionProvider.earnings;
    if (earnings == null) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Commission Breakdown',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 12.0),
          CommissionBreakdownWidget(earnings: earnings),
        ],
      ),
    );
  }

  Widget _buildCommissionChart(CommissionProvider commissionProvider) {
    final earnings = commissionProvider.earnings;
    if (earnings == null) return const SizedBox.shrink();

    final monthlyData = earnings['monthlyData'] as List<dynamic>? ?? [];
    final commissionTypes = earnings['commissionTypes'] as Map<String, dynamic>? ?? {};

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Earnings Overview',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 12.0),
          CommissionChartWidget(
            monthlyData: monthlyData.map((e) => (e as num).toDouble()).toList(),
            commissionTypes: commissionTypes,
          ),
        ],
      ),
    );
  }

  Widget _buildRecentCommissions(
    ThemeData theme,
    CommissionProvider commissionProvider,
  ) {
    final commissions = commissionProvider.commissionHistory.take(5).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recent Commissions',
                style: theme.textTheme.titleLarge?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/commissions/history');
                },
                child: Text(
                  'View All',
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12.0),
        if (commissions.isEmpty)
          Padding(
            padding: const EdgeInsets.all(32.0),
            child: Center(
              child: Column(
                children: [
                  const Icon(
                    Icons.monetization_on_outlined,
                    size: 64.0,
                    color: AppColors.textTertiary,
                  ),
                  const SizedBox(height: 16.0),
                  Text(
                    'No commissions yet',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            itemCount: commissions.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8.0),
            itemBuilder: (context, index) {
              return CommissionCardWidget(
                commission: commissions[index],
                onTap: () {
                  _showCommissionDetails(commissions[index]);
                },
              );
            },
          ),
        const SizedBox(height: 24.0),
      ],
    );
  }

  void _showCommissionDetails(dynamic commission) {
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
                    'Commission Details',
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
            const SizedBox(height: 24.0),
            _buildDetailRow('Type', commission.type.toUpperCase()),
            _buildDetailRow('Amount', CurrencyUtils.formatINR(commission.amount)),
            _buildDetailRow('Level', 'Level ${commission.level}'),
            if (commission.fromUser != null)
              _buildDetailRow('From', commission.fromUser!.fullName),
            _buildDetailRow('Description', commission.description),
            _buildDetailRow('Status', commission.status.toUpperCase()),
            if (commission.paidDate != null)
              _buildDetailRow('Paid Date', commission.paidDate.toString()),
            const SizedBox(height: 24.0),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120.0,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                  ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
