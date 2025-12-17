import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/currency_utils.dart';
import '../../../../core/extensions/date_extensions.dart';
import '../../../../data/models/payout_model.dart';

/// Withdrawal card widget - Displays withdrawal request information
///
/// Shows withdrawal details with status and optional cancel action
class WithdrawalCardWidget extends StatelessWidget {
  final PayoutModel payout;
  final VoidCallback? onTap;
  final VoidCallback? onCancel;

  const WithdrawalCardWidget({
    required this.payout, super.key,
    this.onTap,
    this.onCancel,
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
              color: _getStatusBorderColor(),
              width: 1.0,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _buildStatusIcon(),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          CurrencyUtils.formatINR(payout.amount),
                          style: theme.textTheme.titleLarge?.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4.0),
                        Text(
                          payout.method.toUpperCase(),
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _buildStatusBadge(theme),
                ],
              ),
              const Divider(height: 24.0),
              Row(
                children: [
                  const Icon(
                    Icons.calendar_today,
                    size: 14.0,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: 6.0),
                  Text(
                    'Requested: ${payout.requestDate.formatDate()}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              if (payout.processedDate != null) ...[
                const SizedBox(height: 6.0),
                Row(
                  children: [
                    const Icon(
                      Icons.check_circle,
                      size: 14.0,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 6.0),
                    Text(
                      'Processed: ${payout.processedDate!.formatDate()}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
              if (payout.bankAccount != null) ...[
                const SizedBox(height: 6.0),
                Row(
                  children: [
                    const Icon(
                      Icons.account_balance,
                      size: 14.0,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 6.0),
                    Expanded(
                      child: Text(
                        '${payout.bankAccount!.bankName} - ****${payout.bankAccount!.accountNumber.substring(payout.bankAccount!.accountNumber.length - 4)}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
              if (payout.transactionId != null) ...[
                const SizedBox(height: 6.0),
                Row(
                  children: [
                    const Icon(
                      Icons.receipt,
                      size: 14.0,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 6.0),
                    Expanded(
                      child: Text(
                        'TXN: ${payout.transactionId}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
              if (onCancel != null) ...[
                const SizedBox(height: 12.0),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: onCancel,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                    ),
                    child: const Text('Cancel Request'),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusIcon() {
    IconData icon;
    Color color;

    switch (payout.status.toLowerCase()) {
      case 'pending':
        icon = Icons.pending_outlined;
        color = AppColors.warning;
        break;
      case 'processing':
        icon = Icons.autorenew;
        color = AppColors.info;
        break;
      case 'completed':
        icon = Icons.check_circle_outline;
        color = AppColors.success;
        break;
      case 'failed':
      case 'rejected':
        icon = Icons.error_outline;
        color = AppColors.error;
        break;
      default:
        icon = Icons.help_outline;
        color = AppColors.textSecondary;
    }

    return Container(
      padding: const EdgeInsets.all(10.0),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10.0),
      ),
      child: Icon(
        icon,
        color: color,
        size: 24.0,
      ),
    );
  }

  Widget _buildStatusBadge(ThemeData theme) {
    final statusColor = _getStatusColor();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: statusColor),
      ),
      child: Text(
        payout.status.toUpperCase(),
        style: theme.textTheme.labelSmall?.copyWith(
          color: statusColor,
          fontWeight: FontWeight.bold,
          fontSize: 11.0,
        ),
      ),
    );
  }

  Color _getStatusColor() {
    switch (payout.status.toLowerCase()) {
      case 'pending':
        return AppColors.warning;
      case 'processing':
        return AppColors.info;
      case 'completed':
        return AppColors.success;
      case 'failed':
      case 'rejected':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  Color _getStatusBorderColor() {
    switch (payout.status.toLowerCase()) {
      case 'pending':
        return AppColors.warning.withOpacity(0.3);
      case 'processing':
        return AppColors.info.withOpacity(0.3);
      case 'completed':
        return AppColors.success.withOpacity(0.3);
      case 'failed':
      case 'rejected':
        return AppColors.error.withOpacity(0.3);
      default:
        return AppColors.border;
    }
  }
}
