import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../data/models/ticket_model.dart';

/// Ticket Card Widget - Displays support ticket summary
///
/// Shows ticket ID, subject, status, priority, and last updated time.
class TicketCardWidget extends StatelessWidget {
  final TicketModel ticket;
  final VoidCallback onTap;

  const TicketCardWidget({
    required this.ticket, required this.onTap, super.key,
  });

  Color _getStatusColor() {
    switch (ticket.status.toLowerCase()) {
      case 'open':
        return AppColors.statusActive;
      case 'closed':
        return AppColors.statusInactive;
      case 'in_progress':
        return AppColors.statusProcessing;
      default:
        return AppColors.textSecondary;
    }
  }

  Color _getPriorityColor() {
    switch (ticket.priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return AppColors.error;
      case 'medium':
        return AppColors.warning;
      default:
        return AppColors.textSecondary;
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
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12.0),
      child: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12.0),
          border: Border.all(color: AppColors.border),
          boxShadow: const [
            BoxShadow(
              color: AppColors.shadowLight,
              blurRadius: 4.0,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    ticket.subject,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8.0),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                  decoration: BoxDecoration(
                    color: _getStatusColor().withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: Text(
                    ticket.status.toUpperCase(),
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: _getStatusColor(),
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12.0),
            Row(
              children: [
                const Icon(
                  Icons.confirmation_number_outlined,
                  size: 14.0,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: 4.0),
                Text(
                  '#${ticket.id.substring(0, 8).toUpperCase()}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
                const SizedBox(width: 16.0),
                Icon(
                  Icons.flag,
                  size: 14.0,
                  color: _getPriorityColor(),
                ),
                const SizedBox(width: 4.0),
                Text(
                  ticket.priority.toUpperCase(),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: _getPriorityColor(),
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const Spacer(),
                const Icon(
                  Icons.access_time,
                  size: 14.0,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: 4.0),
                Text(
                  _formatDate(ticket.updatedAt),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
