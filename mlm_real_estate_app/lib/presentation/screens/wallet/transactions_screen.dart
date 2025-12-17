import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../data/providers/wallet_provider.dart';
import '../../../core/utils/currency_utils.dart';
import 'widgets/transaction_tile_widget.dart';

/// Transactions screen - Complete transaction history with filters
///
/// Displays all wallet transactions with filtering and pagination
class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  String _selectedFilter = 'all';
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadTransactions();
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
      final walletProvider = context.read<WalletProvider>();
      if (walletProvider.hasMore && !walletProvider.isLoading) {
        walletProvider.loadMoreTransactions();
      }
    }
  }

  Future<void> _loadTransactions() async {
    final walletProvider = context.read<WalletProvider>();
    await walletProvider.getTransactions(
      refresh: true,
      type: _selectedFilter == 'all' ? null : _selectedFilter,
    );
  }

  Future<void> _handleRefresh() async {
    await _loadTransactions();
  }

  void _onFilterChanged(String? filter) {
    if (filter != null && filter != _selectedFilter) {
      setState(() {
        _selectedFilter = filter;
      });
      _loadTransactions();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Transactions'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            onSelected: (value) {
              if (value == 'download') {
                _downloadStatement();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'download',
                child: Row(
                  children: [
                    Icon(Icons.download, size: 20.0),
                    SizedBox(width: 12.0),
                    Text('Download Statement'),
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
          Expanded(
            child: Consumer<WalletProvider>(
              builder: (context, walletProvider, child) {
                if (walletProvider.isLoading &&
                    walletProvider.transactions.isEmpty) {
                  return const Center(child: LoadingWidget());
                }

                if (walletProvider.errorMessage != null &&
                    walletProvider.transactions.isEmpty) {
                  return Center(
                    child: custom_error.CustomErrorWidget(
                      message: walletProvider.errorMessage!,
                      onRetry: _loadTransactions,
                    ),
                  );
                }

                if (walletProvider.transactions.isEmpty) {
                  return _buildEmptyState(theme);
                }

                return RefreshIndicator(
                  onRefresh: _handleRefresh,
                  color: AppColors.primary,
                  child: ListView.separated(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16.0),
                    itemCount: walletProvider.transactions.length +
                        (walletProvider.hasMore ? 1 : 0),
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 8.0),
                    itemBuilder: (context, index) {
                      if (index >= walletProvider.transactions.length) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: LoadingWidget(),
                          ),
                        );
                      }

                      final transaction = walletProvider.transactions[index];
                      return TransactionTileWidget(
                        transaction: transaction,
                        onTap: () {
                          _showTransactionDetails(transaction);
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
                _buildFilterChip('Credit', 'credit'),
                const SizedBox(width: 8.0),
                _buildFilterChip('Debit', 'debit'),
                const SizedBox(width: 8.0),
                _buildFilterChip('Commission', 'commission'),
                const SizedBox(width: 8.0),
                _buildFilterChip('Withdrawal', 'withdrawal'),
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

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.receipt_long_outlined,
            size: 80.0,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: 24.0),
          Text(
            'No transactions found',
            style: theme.textTheme.titleLarge?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8.0),
          Text(
            'Your transaction history will appear here',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  void _showTransactionDetails(dynamic transaction) {
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
                    'Transaction Details',
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
            _buildDetailRow('Type', transaction.type.toUpperCase()),
            _buildDetailRow('Amount', CurrencyUtils.formatINR(transaction.amount)),
            _buildDetailRow('Description', transaction.description),
            _buildDetailRow('Status', transaction.status.toUpperCase()),
            _buildDetailRow('Date', transaction.transactionDate.formatDateTime()),
            if (transaction.referenceId != null)
              _buildDetailRow('Reference ID', transaction.referenceId!),
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

  void _downloadStatement() {
    // TODO: Implement download statement
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Statement download feature coming soon'),
      ),
    );
  }
}
