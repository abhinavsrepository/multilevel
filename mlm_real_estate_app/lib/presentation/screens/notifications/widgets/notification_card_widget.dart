import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../data/models/notification_model.dart';

/// Notification Card Widget - Displays notification information
///
/// Shows type icon, title, message, timestamp, and read/unread indicator.
class NotificationCardWidget extends StatelessWidget {
  final NotificationModel notification;
  final VoidCallback onTap;

  const NotificationCardWidget({
    required this.notification, required this.onTap, super.key,
  });

  IconData _getNotificationIcon() {
    switch (notification.type.toLowerCase()) {
      case 'transaction':
      case 'payment':
        return Icons.payment;
      case 'commission':
        return Icons.monetization_on;
      case 'investment':
        return Icons.trending_up;
      case 'kyc':
        return Icons.verified_user;
      case 'team':
      case 'referral':
        return Icons.group;
      case 'payout':
      case 'withdrawal':
        return Icons.account_balance_wallet;
      case 'success':
        return Icons.check_circle_outline;
      case 'warning':
        return Icons.warning_amber;
      case 'error':
        return Icons.error_outline;
      case 'info':
      default:
        return Icons.info_outline;
    }
  }

  Color _getNotificationColor() {
    switch (notification.type.toLowerCase()) {
      case 'transaction':
      case 'payment':
        return AppColors.info;
      case 'commission':
        return AppColors.success;
      case 'investment':
        return AppColors.primary;
      case 'kyc':
        return AppColors.warning;
      case 'team':
      case 'referral':
        return AppColors.tertiary;
      case 'payout':
      case 'withdrawal':
        return AppColors.secondary;
      case 'success':
        return AppColors.success;
      case 'warning':
        return AppColors.warning;
      case 'error':
        return AppColors.error;
      case 'info':
      default:
        return AppColors.info;
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inDays < 1) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM dd, yyyy').format(date);
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getNotificationColor();

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12.0),
      child: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: notification.isRead ? AppColors.surface : AppColors.primaryExtraLight.withOpacity(0.3),
          borderRadius: BorderRadius.circular(12.0),
          border: Border.all(
            color: notification.isRead ? AppColors.border : AppColors.primary.withOpacity(0.3),
          ),
          boxShadow: const [
            BoxShadow(
              color: AppColors.shadowLight,
              blurRadius: 4.0,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 48.0,
              height: 48.0,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12.0),
              ),
              child: Icon(
                _getNotificationIcon(),
                color: color,
                size: 24.0,
              ),
            ),
            const SizedBox(width: 16.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notification.title,
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w600,
                              ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (!notification.isRead) ...[
                        const SizedBox(width: 8.0),
                        Container(
                          width: 8.0,
                          height: 8.0,
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    notification.message,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                          height: 1.4,
                        ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8.0),
                  Row(
                    children: [
                      const Icon(
                        Icons.access_time,
                        size: 14.0,
                        color: AppColors.textTertiary,
                      ),
                      const SizedBox(width: 4.0),
                      Text(
                        _formatDate(notification.createdAt),
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: AppColors.textTertiary,
                            ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
