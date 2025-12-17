import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../data/providers/payout_provider.dart';
import '../../../core/utils/currency_utils.dart';
import 'widgets/withdrawal_card_widget.dart';

/// Withdrawal history screen - List of all withdrawal requests
///
/// Displays withdrawal request history with status filtering
class WithdrawalHistoryScreen extends StatefulWidget {
  const WithdrawalHistoryScreen({super.key});

  @override
  State<WithdrawalHistoryScreen> createState() => _WithdrawalHistoryScreenState();
}

class _WithdrawalHistoryScreenState extends State<WithdrawalHistoryScreen> {
  String _selectedFilter = 'all';
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadPayouts();
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
      final payoutProvider = context.read<PayoutProvider>();
      if (payoutProvider.hasMore && !payoutProvider.isLoading) {
        payoutProvider.loadMore();
      }
    }
  }

  Future<void> _loadPayouts() async {
    final payoutProvider = context.read<PayoutProvider>();
    await payoutProvider.getPayouts(refresh: true);
  }

  Future<void> _handleRefresh() async {
    await _loadPayouts();
  }

  List<dynamic> _getFilteredPayouts(PayoutProvider payoutProvider) {
    switch (_selectedFilter) {
      case 'pending':
        return payoutProvider.payouts
            .where((p) => p.status == 'pending')
            .toList();
      case 'processing':
        return payoutProvider.payouts
            .where((p) => p.status == 'processing')
            .toList();
      case 'completed':
        return payoutProvider.payouts
            .where((p) => p.status == 'completed')
            .toList();
      case 'failed':
        return payoutProvider.payouts
            .where((p) => p.status == 'failed' || p.status == 'rejected')
            .toList();
      default:
        return payoutProvider.payouts;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Withdrawal History'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: Column(
        children: [
          _buildFilters(theme),
          Expanded(
            child: Consumer<PayoutProvider>(
              builder: (context, payoutProvider, child) {
                if (payoutProvider.isLoading && payoutProvider.payouts.isEmpty) {
                  return const Center(child: LoadingWidget());
                }

                if (payoutProvider.errorMessage != null &&
                    payoutProvider.payouts.isEmpty) {
                  return Center(
                    child: custom_error.CustomErrorWidget(
                      message: payoutProvider.errorMessage!,
                      onRetry: _loadPayouts,
                    ),
                  );
                }

                final filteredPayouts = _getFilteredPayouts(payoutProvider);

                if (filteredPayouts.isEmpty) {
                  return _buildEmptyState(theme);
                }

                return RefreshIndicator(
                  onRefresh: _handleRefresh,
                  color: AppColors.primary,
                  child: ListView.separated(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16.0),
                    itemCount: filteredPayouts.length +
                        (payoutProvider.hasMore && _selectedFilter == 'all' ? 1 : 0),
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 12.0),
                    itemBuilder: (context, index) {
                      if (index >= filteredPayouts.length) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: LoadingWidget(),
                          ),
                        );
                      }

                      final payout = filteredPayouts[index];
                      return WithdrawalCardWidget(
                        payout: payout,
                        onTap: () {
                          _showPayoutDetails(payout);
                        },
                        onCancel: payout.status == 'pending'
                            ? () => _cancelPayout(payout.id)
                            : null,
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
            'Filter by Status',
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
                _buildFilterChip('Pending', 'pending'),
                const SizedBox(width: 8.0),
                _buildFilterChip('Processing', 'processing'),
                const SizedBox(width: 8.0),
                _buildFilterChip('Completed', 'completed'),
                const SizedBox(width: 8.0),
                _buildFilterChip('Failed', 'failed'),
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
      onSelected: (_) {
        setState(() {
          _selectedFilter = value;
        });
      },
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

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.pending_actions_outlined,
            size: 80.0,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: 24.0),
          Text(
            'No withdrawals found',
            style: theme.textTheme.titleLarge?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8.0),
          Text(
            'Your withdrawal requests will appear here',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  void _showPayoutDetails(dynamic payout) {
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
                    'Withdrawal Details',
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
            _buildDetailRow('Amount', CurrencyUtils.formatINR(payout.amount)),
            _buildDetailRow('Method', payout.method.toUpperCase()),
            _buildDetailRow('Status', payout.status.toUpperCase()),
            _buildDetailRow('Request Date', payout.requestDate.formatDateTime()),
            if (payout.processedDate != null)
              _buildDetailRow('Processed Date', payout.processedDate!.formatDateTime()),
            if (payout.transactionId != null)
              _buildDetailRow('Transaction ID', payout.transactionId!),
            if (payout.bankAccount != null) ...[
              const Divider(height: 32.0),
              Text(
                'Bank Details',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16.0),
              _buildDetailRow('Bank Name', payout.bankAccount!.bankName),
              _buildDetailRow(
                'Account Number',
                '****${payout.bankAccount!.accountNumber.substring(payout.bankAccount!.accountNumber.length - 4)}',
              ),
              _buildDetailRow('IFSC Code', payout.bankAccount!.ifscCode),
            ],
            if (payout.remarks != null) ...[
              const Divider(height: 32.0),
              Text(
                'Remarks',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 8.0),
              Text(
                payout.remarks!,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
            ],
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

  Future<void> _cancelPayout(String payoutId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Withdrawal'),
        content: const Text('Are you sure you want to cancel this withdrawal request?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final payoutProvider = context.read<PayoutProvider>();
    final success = await payoutProvider.cancelPayout(payoutId);

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Withdrawal request cancelled successfully'),
          backgroundColor: AppColors.success,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            payoutProvider.errorMessage ?? 'Failed to cancel withdrawal',
          ),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }
}
