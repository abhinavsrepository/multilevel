import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../data/providers/wallet_provider.dart';
import '../../../core/utils/currency_utils.dart';
import 'widgets/wallet_card_widget.dart';
import 'widgets/transaction_tile_widget.dart';

/// Wallet screen - Main wallet dashboard
///
/// Displays wallet balance, quick actions, and recent transactions
class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadWalletData();
    });
  }

  Future<void> _loadWalletData() async {
    final walletProvider = context.read<WalletProvider>();
    await Future.wait([
      walletProvider.getWalletBalance(),
      walletProvider.getTransactions(refresh: true),
    ]);
  }

  Future<void> _handleRefresh() async {
    await context.read<WalletProvider>().refresh();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Wallet'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {
              Navigator.pushNamed(context, '/wallet/transactions');
            },
            tooltip: 'Transaction History',
          ),
        ],
      ),
      body: Consumer<WalletProvider>(
        builder: (context, walletProvider, child) {
          if (walletProvider.isLoading && walletProvider.wallet == null) {
            return const Center(child: LoadingWidget());
          }

          if (walletProvider.errorMessage != null && walletProvider.wallet == null) {
            return Center(
              child: custom_error.CustomErrorWidget(
                message: walletProvider.errorMessage!,
                onRetry: _loadWalletData,
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
                      _buildBalanceCards(walletProvider),
                      const SizedBox(height: 24.0),
                      _buildQuickActions(),
                      const SizedBox(height: 24.0),
                      _buildRecentTransactions(theme, walletProvider),
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

  Widget _buildBalanceCards(WalletProvider walletProvider) {
    final wallet = walletProvider.wallet;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        children: [
          WalletCardWidget(
            title: 'Available Balance',
            amount: wallet?.availableBalance ?? 0.0,
            icon: Icons.account_balance_wallet,
            gradient: AppColors.primaryGradient,
            onTap: () {},
          ),
          const SizedBox(height: 12.0),
          Row(
            children: [
              Expanded(
                child: WalletCardWidget(
                  title: 'Locked',
                  amount: wallet?.lockedBalance ?? 0.0,
                  icon: Icons.lock,
                  gradient: AppColors.warningGradient,
                  isSmall: true,
                  onTap: () {},
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: WalletCardWidget(
                  title: 'Total',
                  amount: wallet?.balance ?? 0.0,
                  icon: Icons.account_balance,
                  gradient: AppColors.successGradient,
                  isSmall: true,
                  onTap: () {},
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16.0),
          border: Border.all(color: AppColors.border),
          boxShadow: const [
            BoxShadow(
              color: AppColors.shadowLight,
              blurRadius: 8.0,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Quick Actions',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16.0),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildQuickActionButton(
                  icon: Icons.arrow_upward,
                  label: 'Withdraw',
                  color: AppColors.error,
                  onTap: () {
                    Navigator.pushNamed(context, '/wallet/withdraw');
                  },
                ),
                _buildQuickActionButton(
                  icon: Icons.arrow_downward,
                  label: 'Add Funds',
                  color: AppColors.success,
                  onTap: () {
                    // TODO: Implement add funds
                  },
                ),
                _buildQuickActionButton(
                  icon: Icons.swap_horiz,
                  label: 'Transfer',
                  color: AppColors.info,
                  onTap: () {
                    // TODO: Implement transfer
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12.0),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 16.0),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12.0),
              ),
              child: Icon(icon, color: color, size: 24.0),
            ),
            const SizedBox(height: 8.0),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentTransactions(ThemeData theme, WalletProvider walletProvider) {
    final transactions = walletProvider.transactions.take(5).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recent Transactions',
                style: theme.textTheme.titleLarge?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/wallet/transactions');
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
        if (transactions.isEmpty)
          Padding(
            padding: const EdgeInsets.all(32.0),
            child: Center(
              child: Column(
                children: [
                  const Icon(
                    Icons.receipt_long_outlined,
                    size: 64.0,
                    color: AppColors.textTertiary,
                  ),
                  const SizedBox(height: 16.0),
                  Text(
                    'No transactions yet',
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
            itemCount: transactions.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8.0),
            itemBuilder: (context, index) {
              return TransactionTileWidget(
                transaction: transactions[index],
                onTap: () {
                  _showTransactionDetails(transactions[index]);
                },
              );
            },
          ),
        const SizedBox(height: 16.0),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: OutlinedButton(
            onPressed: () {
              Navigator.pushNamed(context, '/wallet/withdrawal-history');
            },
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48.0),
              side: const BorderSide(color: AppColors.primary),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.0),
              ),
            ),
            child: const Text('Withdrawal History'),
          ),
        ),
        const SizedBox(height: 24.0),
      ],
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
}
