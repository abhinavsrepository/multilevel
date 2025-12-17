import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../data/models/bank_account_model.dart';

/// Bank card widget - Displays bank account information
///
/// Shows bank details with primary badge and action buttons
class BankCardWidget extends StatelessWidget {
  final BankAccountModel bankAccount;
  final VoidCallback? onTap;
  final VoidCallback? onSetPrimary;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const BankCardWidget({
    required this.bankAccount, super.key,
    this.onTap,
    this.onSetPrimary,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(12.0),
      elevation: 2.0,
      shadowColor: AppColors.shadowLight,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12.0),
        child: Container(
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12.0),
            border: Border.all(
              color: bankAccount.isPrimary ? AppColors.primary : AppColors.border,
              width: bankAccount.isPrimary ? 2.0 : 1.0,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10.0),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                    child: const Icon(
                      Icons.account_balance,
                      color: AppColors.primary,
                      size: 24.0,
                    ),
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                bankAccount.bankName,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  color: AppColors.textPrimary,
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (bankAccount.isPrimary)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8.0,
                                  vertical: 4.0,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.success.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(4.0),
                                  border: Border.all(color: AppColors.success),
                                ),
                                child: Text(
                                  'PRIMARY',
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    color: AppColors.success,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 10.0,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4.0),
                        Text(
                          bankAccount.accountType.toUpperCase(),
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16.0),
              _buildDetailRow(
                icon: Icons.person,
                label: bankAccount.accountHolderName,
                theme: theme,
              ),
              const SizedBox(height: 8.0),
              _buildDetailRow(
                icon: Icons.credit_card,
                label: _maskAccountNumber(bankAccount.accountNumber),
                theme: theme,
              ),
              const SizedBox(height: 8.0),
              _buildDetailRow(
                icon: Icons.code,
                label: bankAccount.ifscCode,
                theme: theme,
              ),
              const SizedBox(height: 8.0),
              _buildDetailRow(
                icon: Icons.location_on,
                label: bankAccount.branch,
                theme: theme,
              ),
              if (onSetPrimary != null || onEdit != null || onDelete != null) ...[
                const Divider(height: 24.0),
                Row(
                  children: [
                    if (onSetPrimary != null)
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: onSetPrimary,
                          icon: const Icon(Icons.star, size: 16.0),
                          label: const Text('Set Primary'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.primary,
                            side: const BorderSide(color: AppColors.primary),
                          ),
                        ),
                      ),
                    if (onSetPrimary != null && (onEdit != null || onDelete != null))
                      const SizedBox(width: 8.0),
                    if (onEdit != null)
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: onEdit,
                          icon: const Icon(Icons.edit, size: 16.0),
                          label: const Text('Edit'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.info,
                            side: const BorderSide(color: AppColors.info),
                          ),
                        ),
                      ),
                    if (onEdit != null && onDelete != null)
                      const SizedBox(width: 8.0),
                    if (onDelete != null)
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: onDelete,
                          icon: const Icon(Icons.delete, size: 16.0),
                          label: const Text('Delete'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.error,
                            side: const BorderSide(color: AppColors.error),
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required ThemeData theme,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16.0,
          color: AppColors.textSecondary,
        ),
        const SizedBox(width: 8.0),
        Expanded(
          child: Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }

  String _maskAccountNumber(String accountNumber) {
    if (accountNumber.length <= 4) {
      return accountNumber;
    }
    return '****${accountNumber.substring(accountNumber.length - 4)}';
  }
}
