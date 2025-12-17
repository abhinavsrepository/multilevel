import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../data/providers/bank_provider.dart';
import '../../../core/utils/snackbar_utils.dart';
import 'widgets/bank_card_widget.dart';

/// Bank accounts screen - List of all bank accounts
///
/// Displays user's bank accounts with options to add, edit, delete, and set primary
class BankAccountsScreen extends StatefulWidget {
  const BankAccountsScreen({super.key});

  @override
  State<BankAccountsScreen> createState() => _BankAccountsScreenState();
}

class _BankAccountsScreenState extends State<BankAccountsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadBankAccounts();
    });
  }

  Future<void> _loadBankAccounts() async {
    final bankProvider = context.read<BankProvider>();
    await bankProvider.getBankAccounts();
  }

  Future<void> _handleRefresh() async {
    await context.read<BankProvider>().refresh();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Bank Accounts'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: Consumer<BankProvider>(
        builder: (context, bankProvider, child) {
          if (bankProvider.isLoading && bankProvider.bankAccounts.isEmpty) {
            return const Center(child: LoadingWidget());
          }

          if (bankProvider.errorMessage != null && bankProvider.bankAccounts.isEmpty) {
            return Center(
              child: custom_error.CustomErrorWidget(
                message: bankProvider.errorMessage!,
                onRetry: _loadBankAccounts,
              ),
            );
          }

          if (bankProvider.bankAccounts.isEmpty) {
            return _buildEmptyState(theme);
          }

          return RefreshIndicator(
            onRefresh: _handleRefresh,
            color: AppColors.primary,
            child: ListView.separated(
              padding: const EdgeInsets.all(16.0),
              itemCount: bankProvider.bankAccounts.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12.0),
              itemBuilder: (context, index) {
                final account = bankProvider.bankAccounts[index];
                return BankCardWidget(
                  bankAccount: account,
                  onTap: () {
                    _showBankAccountDetails(account);
                  },
                  onSetPrimary: account.isPrimary
                      ? null
                      : () => _setPrimaryAccount(account.id),
                  onEdit: () => _editBankAccount(account.id),
                  onDelete: account.isPrimary
                      ? null
                      : () => _deleteBankAccount(account.id),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.pushNamed(context, '/wallet/add-bank-account');
        },
        icon: const Icon(Icons.add),
        label: const Text('Add Account'),
        backgroundColor: AppColors.primary,
      ),
    );
  }

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.account_balance_outlined,
            size: 80.0,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: 24.0),
          Text(
            'No bank accounts added',
            style: theme.textTheme.titleLarge?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8.0),
          Text(
            'Add a bank account to receive withdrawals',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24.0),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pushNamed(context, '/wallet/add-bank-account');
            },
            icon: const Icon(Icons.add),
            label: const Text('Add Bank Account'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
            ),
          ),
        ],
      ),
    );
  }

  void _showBankAccountDetails(dynamic account) {
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
                    'Bank Account Details',
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
            _buildDetailRow('Account Holder', account.accountHolderName),
            _buildDetailRow('Bank Name', account.bankName),
            _buildDetailRow('Branch', account.branch),
            _buildDetailRow('Account Number', account.accountNumber),
            _buildDetailRow('IFSC Code', account.ifscCode),
            _buildDetailRow('Account Type', account.accountType.toUpperCase()),
            _buildDetailRow('Status', account.status.toUpperCase()),
            if (account.isPrimary)
              _buildDetailRow('Primary', 'Yes'),
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
            width: 140.0,
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

  Future<void> _setPrimaryAccount(String accountId) async {
    final bankProvider = context.read<BankProvider>();
    final success = await bankProvider.setPrimaryAccount(accountId);

    if (!mounted) return;

    if (success) {
      SnackbarUtils.showSuccess(
        context:context, message:
        'Primary account updated successfully',
      );
    } else {
      SnackbarUtils.showError(
        context:context, message:
        bankProvider.errorMessage ?? 'Failed to set primary account',
      );
    }
  }

  Future<void> _editBankAccount(String accountId) async {
    // Navigate to edit screen (to be implemented)
    SnackbarUtils.showInfo(
      context:context,
      message: 'Edit functionality coming soon',
    );
  }

  Future<void> _deleteBankAccount(String accountId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Bank Account'),
        content: const Text(
          'Are you sure you want to delete this bank account? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final bankProvider = context.read<BankProvider>();
    final success = await bankProvider.deleteBankAccount(accountId);

    if (!mounted) return;

    if (success) {
      SnackbarUtils.showSuccess(
        context:context, message:
        'Bank account deleted successfully',
      );
    } else {
      SnackbarUtils.showError(
        context:context, message:
        bankProvider.errorMessage ?? 'Failed to delete bank account',
      );
    }
  }
}
