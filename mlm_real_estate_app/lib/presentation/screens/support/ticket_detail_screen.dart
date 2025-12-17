import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:file_picker/file_picker.dart';
import '../../../core/constants/color_constants.dart';
import '../../../data/providers/ticket_provider.dart';
import '../../../data/models/ticket_model.dart';
import 'widgets/message_bubble_widget.dart';

/// Ticket Detail Screen - Support ticket details and conversation
///
/// Shows ticket information, message history, and allows replying with attachments.
class TicketDetailScreen extends StatefulWidget {
  final String ticketId;

  const TicketDetailScreen({
    required this.ticketId, super.key,
  });

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  final TextEditingController _replyController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  Timer? _refreshTimer;
  final List<File> _attachments = [];
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _loadTicketDetail();
    _startAutoRefresh();
  }

  @override
  void dispose() {
    _replyController.dispose();
    _scrollController.dispose();
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadTicketDetail() async {
    final provider = context.read<TicketProvider>();
    await provider.getTicketDetail(widget.ticketId);
    _scrollToBottom();
  }

  void _startAutoRefresh() {
    _refreshTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      if (mounted) {
        _loadTicketDetail();
      }
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _pickAttachments() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      );

      if (result != null && result.files.isNotEmpty) {
        setState(() {
          _attachments.addAll(
            result.files.map((file) => File(file.path!)).toList(),
          );
        });
      }
    } catch (e) {
      _showMessage('Failed to pick files: $e');
    }
  }

  void _removeAttachment(int index) {
    setState(() {
      _attachments.removeAt(index);
    });
  }

  Future<void> _sendReply() async {
    final message = _replyController.text.trim();

    if (message.isEmpty && _attachments.isEmpty) {
      _showMessage('Please enter a message or attach a file');
      return;
    }

    setState(() => _isSending = true);

    try {
      final provider = context.read<TicketProvider>();
      final success = await provider.replyToTicket(
        widget.ticketId,
        message,
        attachments: _attachments.isNotEmpty ? _attachments : null,
      );

      if (success) {
        _replyController.clear();
        setState(() {
          _attachments.clear();
        });
        _scrollToBottom();
      } else if (provider.errorMessage != null) {
        _showMessage(provider.errorMessage!);
      }
    } finally {
      if (mounted) {
        setState(() => _isSending = false);
      }
    }
  }

  Future<void> _closeTicket() async {
    final confirmed = await _showConfirmDialog(
      'Close Ticket',
      'Are you sure you want to close this ticket? You cannot reopen it later.',
    );

    if (confirmed != true) return;

    final provider = context.read<TicketProvider>();
    final success = await provider.closeTicket(widget.ticketId);

    if (success) {
      _showMessage('Ticket closed successfully');
      Navigator.pop(context, true);
    } else if (provider.errorMessage != null) {
      _showMessage(provider.errorMessage!);
    }
  }

  Future<bool?> _showConfirmDialog(String title, String message) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Close Ticket'),
          ),
        ],
      ),
    );
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Ticket Details'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        actions: [
          Consumer<TicketProvider>(
            builder: (context, provider, child) {
              final ticket = provider.selectedTicket;
              if (ticket != null && ticket.status != 'closed') {
                return IconButton(
                  icon: const Icon(Icons.close),
                  tooltip: 'Close Ticket',
                  onPressed: _closeTicket,
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
      body: Consumer<TicketProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.selectedTicket == null) {
            return const Center(child: CircularProgressIndicator());
          }

          final ticket = provider.selectedTicket;
          if (ticket == null) {
            return const Center(child: Text('Ticket not found'));
          }

          return Column(
            children: [
              _buildTicketHeader(ticket),
              Expanded(
                child: _buildMessagesList(ticket),
              ),
              if (ticket.status != 'closed') _buildReplyInput(),
            ],
          );
        },
      ),
    );
  }

  Widget _buildTicketHeader(TicketModel ticket) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      color: AppColors.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ticket.subject,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      'Ticket #${ticket.id.substring(0, 8).toUpperCase()}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                    ),
                  ],
                ),
              ),
              _buildStatusBadge(ticket.status),
            ],
          ),
          const SizedBox(height: 12.0),
          Row(
            children: [
              _buildInfoChip(Icons.category_outlined, ticket.category),
              const SizedBox(width: 8.0),
              _buildPriorityChip(ticket.priority),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status.toLowerCase()) {
      case 'open':
        color = AppColors.statusActive;
        break;
      case 'closed':
        color = AppColors.statusInactive;
        break;
      case 'in_progress':
        color = AppColors.statusProcessing;
        break;
      default:
        color = AppColors.textSecondary;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12.0),
      ),
      child: Text(
        status.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14.0, color: AppColors.textSecondary),
          const SizedBox(width: 4.0),
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriorityChip(String priority) {
    Color color;
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        color = AppColors.error;
        break;
      case 'medium':
        color = AppColors.warning;
        break;
      default:
        color = AppColors.textSecondary;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.flag, size: 14.0, color: color),
          const SizedBox(width: 4.0),
          Text(
            priority.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: color,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessagesList(TicketModel ticket) {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16.0),
      itemCount: ticket.replies.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return MessageBubbleWidget(
            message: ticket.description,
            userName: ticket.user?.fullName ?? 'You',
            isStaffReply: false,
            timestamp: ticket.createdAt,
            attachments: ticket.attachments,
          );
        }

        final reply = ticket.replies[index - 1];
        return MessageBubbleWidget(
          message: reply.message,
          userName: reply.userName,
          isStaffReply: reply.isStaffReply,
          timestamp: reply.createdAt,
          attachments: reply.attachments,
        );
      },
    );
  }

  Widget _buildReplyInput() {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 8.0,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_attachments.isNotEmpty) _buildAttachmentsList(),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.attach_file),
                onPressed: _pickAttachments,
                color: AppColors.primary,
              ),
              Expanded(
                child: TextField(
                  controller: _replyController,
                  decoration: InputDecoration(
                    hintText: 'Type your message...',
                    filled: true,
                    fillColor: AppColors.inputFill,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24.0),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                      vertical: 12.0,
                    ),
                  ),
                  maxLines: null,
                  textInputAction: TextInputAction.newline,
                ),
              ),
              const SizedBox(width: 8.0),
              _isSending
                  ? const SizedBox(
                      width: 40.0,
                      height: 40.0,
                      child: CircularProgressIndicator(strokeWidth: 2.0),
                    )
                  : IconButton(
                      icon: const Icon(Icons.send),
                      onPressed: _sendReply,
                      color: AppColors.primary,
                    ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAttachmentsList() {
    return Container(
      margin: const EdgeInsets.only(bottom: 8.0),
      child: Wrap(
        spacing: 8.0,
        runSpacing: 8.0,
        children: _attachments.asMap().entries.map((entry) {
          final index = entry.key;
          final file = entry.value;
          final fileName = file.path.split('/').last;

          return Chip(
            label: Text(
              fileName,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            deleteIcon: const Icon(Icons.close, size: 18.0),
            onDeleted: () => _removeAttachment(index),
            backgroundColor: AppColors.surfaceVariant,
          );
        }).toList(),
      ),
    );
  }
}
