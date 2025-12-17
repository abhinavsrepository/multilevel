import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../data/models/dashboard_model.dart';

/// Activity card widget displaying recent activity
///
/// Shows activity type icon, description, amount, date, and status
class ActivityCardWidget extends StatelessWidget {
  final RecentActivity activity;
  final VoidCallback? onTap;

  const ActivityCardWidget({
    required this.activity, super.key,
    this.onTap,
  });

  IconData _getActivityIcon(String type) {
    switch (type.toLowerCase()) {
      case 'investment':
        return Icons.account_balance_wallet;
      case 'commission':
        return Icons.monetization_on;
      case 'withdrawal':
        return Icons.arrow_upward;
      case 'referral':
        return Icons.group_add;
      case 'rank':
        return Icons.emoji_events;
      case 'payout':
        return Icons.payment;
      default:
        return Icons.info_outline;
    }
  }

  Color _getActivityColor(String type) {
    switch (type.toLowerCase()) {
      case 'investment':
        return AppColors.primary;
      case 'commission':
        return AppColors.success;
      case 'withdrawal':
        return AppColors.warning;
      case 'referral':
        return AppColors.info;
      case 'rank':
        return AppColors.secondary;
      case 'payout':
        return AppColors.tertiary;
      default:
        return AppColors.textSecondary;
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        if (difference.inMinutes == 0) {
          return 'Just now';
        }
        return '${difference.inMinutes}m ago';
      }
      return '${difference.inHours}h ago';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM dd, yyyy').format(date);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final activityColor = _getActivityColor(activity.type);

    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(12.0),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12.0),
        child: Container(
          padding: const EdgeInsets.all(12.0),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12.0),
            border: Border.all(
              color: AppColors.border,
              width: 1.0,
            ),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10.0),
                decoration: BoxDecoration(
                  color: activityColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10.0),
                ),
                child: Icon(
                  _getActivityIcon(activity.type),
                  color: activityColor,
                  size: 22.0,
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      activity.description,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      _formatDate(activity.timestamp),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              if (activity.amount != null) ...[
                const SizedBox(width: 8.0),
                Text(
                  activity.amount! >= 0
                      ? '+₹${activity.amount!.toStringAsFixed(2)}'
                      : '-₹${activity.amount!.abs().toStringAsFixed(2)}',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: activity.amount! >= 0
                        ? AppColors.success
                        : AppColors.error,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
