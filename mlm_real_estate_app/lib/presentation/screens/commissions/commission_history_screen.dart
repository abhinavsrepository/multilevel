import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../data/providers/commission_provider.dart';
import '../../../core/utils/currency_utils.dart';
import 'widgets/commission_card_widget.dart';

/// Commission history screen - Complete commission history with filters
///
/// Displays all commissions with filtering and pagination
class CommissionHistoryScreen extends StatefulWidget {
  const CommissionHistoryScreen({super.key});

  @override
  State<CommissionHistoryScreen> createState() => _CommissionHistoryScreenState();
}

class _CommissionHistoryScreenState extends State<CommissionHistoryScreen> {
  String _selectedFilter = 'all';
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadCommissions();
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      final commissionProvider = context.read<CommissionProvider>();
      if (commissionProvider.hasMore && !commissionProvider.isLoading) {
        commissionProvider.loadMore();
      }
    }
  }

  Future<void> _loadCommissions() async {
    final commissionProvider = context.read<CommissionProvider>();
    await commissionProvider.getCommissionHistory(
      refresh: true,
      type: _selectedFilter == 'all' ? null : _selectedFilter,
    );
  }

  Future<void> _handleRefresh() async {
    await _loadCommissions();
  }

  void _onFilterChanged(String? filter) {
    if (filter != null && filter != _selectedFilter) {
      setState(() {
        _selectedFilter = filter;
      });
      _loadCommissions();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Commission History'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            onSelected: (value) {
              if (value == 'download') {
                _downloadReport();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'download',
                child: Row(
                  children: [
                    Icon(Icons.download, size: 20.0),
                    SizedBox(width: 12.0),
                    Text('Download Report'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilters(theme),
          _buildSummary(theme),
          Expanded(
            child: Consumer<CommissionProvider>(
              builder: (context, commissionProvider, child) {
                if (commissionProvider.isLoading &&
                    commissionProvider.commissionHistory.isEmpty) {
                  return const Center(child: LoadingWidget());
                }

                if (commissionProvider.errorMessage != null &&
                    commissionProvider.commissionHistory.isEmpty) {
                  return Center(
                    child: custom_error.CustomErrorWidget(
                      message: commissionProvider.errorMessage!,
                      onRetry: _loadCommissions,
                    ),
                  );
                }

                if (commissionProvider.commissionHistory.isEmpty) {
                  return _buildEmptyState(theme);
                }

                return RefreshIndicator(
                  onRefresh: _handleRefresh,
                  color: AppColors.primary,
                  child: ListView.separated(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16.0),
                    itemCount: commissionProvider.commissionHistory.length +
                        (commissionProvider.hasMore ? 1 : 0),
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 8.0),
                    itemBuilder: (context, index) {
                      if (index >= commissionProvider.commissionHistory.length) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: LoadingWidget(),
                          ),
                        );
                      }

                      final commission = commissionProvider.commissionHistory[index];
                      return CommissionCardWidget(
                        commission: commission,
                        onTap: () {
                          _showCommissionDetails(commission);
                        },
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(
          bottom: BorderSide(color: AppColors.border),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Filter by Type',
            style: theme.textTheme.titleSmall?.copyWith(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12.0),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip('All', 'all'),
                const SizedBox(width: 8.0),
                _buildFilterChip('Direct', 'direct'),
                const SizedBox(width: 8.0),
                _buildFilterChip('Level', 'level'),
                const SizedBox(width: 8.0),
                _buildFilterChip('Binary', 'binary'),
                const SizedBox(width: 8.0),
                _buildFilterChip('Unilevel', 'unilevel'),
                const SizedBox(width: 8.0),
                _buildFilterChip('Matching', 'matching'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedFilter == value;

    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => _onFilterChanged(value),
      backgroundColor: AppColors.surface,
      selectedColor: AppColors.primary.withOpacity(0.1),
      checkmarkColor: AppColors.primary,
      labelStyle: TextStyle(
        color: isSelected ? AppColors.primary : AppColors.textSecondary,
        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
      ),
      side: BorderSide(
        color: isSelected ? AppColors.primary : AppColors.border,
      ),
    );
  }

  Widget _buildSummary(ThemeData theme) {
    return Consumer<CommissionProvider>(
      builder: (context, commissionProvider, child) {
        final earnings = commissionProvider.earnings;
        if (earnings == null) return const SizedBox.shrink();

        final totalEarnings = (earnings['totalEarnings'] as num?)?.toDouble() ?? 0.0;
        final thisMonthEarnings = (earnings['thisMonthEarnings'] as num?)?.toDouble() ?? 0.0;

        return Container(
          margin: const EdgeInsets.all(16.0),
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12.0),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Total Earnings',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      CurrencyUtils.formatINR(totalEarnings),
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 1.0,
                height: 40.0,
                color: AppColors.border,
              ),
              const SizedBox(width: 16.0),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'This Month',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      CurrencyUtils.formatINR(thisMonthEarnings),
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: AppColors.success,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.monetization_on_outlined,
            size: 80.0,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: 24.0),
          Text(
            'No commissions found',
            style: theme.textTheme.titleLarge?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8.0),
          Text(
            'Your commission history will appear here',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
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
            if (commission.fromUser != null) ...[
              _buildDetailRow('From User', commission.fromUser!.fullName),
              _buildDetailRow('Email', commission.fromUser!.email),
            ],
            _buildDetailRow('Description', commission.description),
            _buildDetailRow('Status', commission.status.toUpperCase()),
            _buildDetailRow('Date', commission.createdAt.formatDateTime()),
            if (commission.paidDate != null)
              _buildDetailRow('Paid Date', commission.paidDate!.formatDateTime()),
            if (commission.propertyId != null)
              _buildDetailRow('Property ID', commission.propertyId!),
            if (commission.investmentId != null)
              _buildDetailRow('Investment ID', commission.investmentId!),
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

  void _downloadReport() {
    // TODO: Implement download report
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Report download feature coming soon'),
      ),
    );
  }
}
