import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/color_constants.dart';

/// Message Bubble Widget - Displays chat message in ticket conversation
///
/// Shows message with different styling for user and staff replies,
/// includes avatar, timestamp, and attachments.
class MessageBubbleWidget extends StatelessWidget {
  final String message;
  final String userName;
  final bool isStaffReply;
  final DateTime timestamp;
  final List<String> attachments;

  const MessageBubbleWidget({
    required this.message, required this.userName, required this.isStaffReply, required this.timestamp, super.key,
    this.attachments = const [],
  });

  String _formatTime(DateTime date) {
    return DateFormat('MMM dd, hh:mm a').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: isStaffReply ? MainAxisAlignment.start : MainAxisAlignment.end,
        children: [
          if (isStaffReply) ...[
            _buildAvatar(),
            const SizedBox(width: 8.0),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment: isStaffReply ? CrossAxisAlignment.start : CrossAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.all(12.0),
                  decoration: BoxDecoration(
                    color: isStaffReply ? AppColors.surfaceVariant : AppColors.primary,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(12.0),
                      topRight: const Radius.circular(12.0),
                      bottomLeft: Radius.circular(isStaffReply ? 0 : 12.0),
                      bottomRight: Radius.circular(isStaffReply ? 12.0 : 0),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        userName,
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: isStaffReply ? AppColors.primary : Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                      const SizedBox(height: 4.0),
                      Text(
                        message,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: isStaffReply ? AppColors.textPrimary : Colors.white,
                              height: 1.5,
                            ),
                      ),
                      if (attachments.isNotEmpty) ...[
                        const SizedBox(height: 8.0),
                        _buildAttachments(),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 4.0),
                Text(
                  _formatTime(timestamp),
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ],
            ),
          ),
          if (!isStaffReply) ...[
            const SizedBox(width: 8.0),
            _buildAvatar(),
          ],
        ],
      ),
    );
  }

  Widget _buildAvatar() {
    return Container(
      width: 36.0,
      height: 36.0,
      decoration: BoxDecoration(
        color: isStaffReply ? AppColors.primary : AppColors.secondary,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          userName.isNotEmpty ? userName[0].toUpperCase() : 'U',
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 16.0,
          ),
        ),
      ),
    );
  }

  Widget _buildAttachments() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: attachments.map((attachment) {
        final fileName = attachment.split('/').last;
        return Padding(
          padding: const EdgeInsets.only(top: 4.0),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.attach_file,
                size: 14.0,
                color: isStaffReply ? AppColors.textSecondary : Colors.white70,
              ),
              const SizedBox(width: 4.0),
              Flexible(
                child: Text(
                  fileName,
                  style: TextStyle(
                    color: isStaffReply ? AppColors.textSecondary : Colors.white70,
                    fontSize: 12.0,
                    decoration: TextDecoration.underline,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
