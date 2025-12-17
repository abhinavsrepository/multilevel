import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../data/models/investment_model.dart';
import '../../../../core/constants/color_constants.dart';

/// Installment card widget for displaying installment information
class InstallmentCardWidget extends StatelessWidget {
  final Installment installment;
  final VoidCallback? onPay;

  const InstallmentCardWidget({
    required this.installment, super.key,
    this.onPay,
  });

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      symbol: '₹',
      decimalDigits: 0,
      locale: 'en_IN',
    );
    return formatter.format(amount);
  }

  String _formatDate(DateTime date) {
    return DateFormat('MMM dd, yyyy').format(date);
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return AppColors.success;
      case 'pending':
        return AppColors.warning;
      case 'overdue':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return Icons.check_circle;
      case 'pending':
        return Icons.pending;
      case 'overdue':
        return Icons.error;
      default:
        return Icons.info;
    }
  }

  bool get _isOverdue {
    return installment.status.toLowerCase() == 'overdue' ||
        (installment.status.toLowerCase() == 'pending' &&
            installment.dueDate.isBefore(DateTime.now()));
  }

  bool get _isPaid {
    return installment.status.toLowerCase() == 'paid';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: _isPaid
            ? AppColors.success.withOpacity(0.05)
            : _isOverdue
                ? AppColors.error.withOpacity(0.05)
                : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _isPaid
              ? AppColors.success.withOpacity(0.3)
              : _isOverdue
                  ? AppColors.error.withOpacity(0.3)
                  : AppColors.border,
          width: _isPaid || _isOverdue ? 1.5 : 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                _buildStatusIndicator(),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildInstallmentInfo(),
                ),
                if (!_isPaid && onPay != null) _buildPayButton(),
              ],
            ),
            if (_isOverdue && !_isPaid) ...[
              const SizedBox(height: 12),
              _buildOverdueAlert(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatusIndicator() {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: _getStatusColor(installment.status).withOpacity(0.1),
        shape: BoxShape.circle,
        border: Border.all(
          color: _getStatusColor(installment.status),
          width: 2,
        ),
      ),
      child: Icon(
        _getStatusIcon(installment.status),
        color: _getStatusColor(installment.status),
        size: 24,
      ),
    );
  }

  Widget _buildInstallmentInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Installment #${installment.installmentNumber}',
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: _getStatusColor(installment.status).withOpacity(0.15),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                installment.status.toUpperCase(),
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w600,
                  color: _getStatusColor(installment.status),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            const Icon(
              Icons.calendar_today,
              size: 12,
              color: AppColors.textSecondary,
            ),
            const SizedBox(width: 4),
            Text(
              'Due: ${_formatDate(installment.dueDate)}',
              style: TextStyle(
                fontSize: 12,
                color: _isOverdue ? AppColors.error : AppColors.textSecondary,
                fontWeight: _isOverdue ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          _formatCurrency(installment.amount),
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: _getStatusColor(installment.status),
          ),
        ),
        if (_isPaid && installment.paidDate != null) ...[
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(
                Icons.check_circle,
                size: 12,
                color: AppColors.success,
              ),
              const SizedBox(width: 4),
              Text(
                'Paid on ${_formatDate(installment.paidDate!)}',
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildPayButton() {
    return ElevatedButton(
      onPressed: onPay,
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        backgroundColor:
            _isOverdue ? AppColors.error : AppColors.primary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      child: const Text(
        'Pay Now',
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildOverdueAlert() {
    final daysOverdue = DateTime.now().difference(installment.dueDate).inDays;
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.error.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.warning,
            size: 16,
            color: AppColors.error,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Overdue by $daysOverdue ${daysOverdue == 1 ? 'day' : 'days'}. Please pay to avoid penalties.',
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.error,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Simple installment list item
class InstallmentListItem extends StatelessWidget {
  final Installment installment;
  final VoidCallback? onTap;

  const InstallmentListItem({
    required this.installment, super.key,
    this.onTap,
  });

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      symbol: '₹',
      decimalDigits: 0,
      locale: 'en_IN',
    );
    return formatter.format(amount);
  }

  String _formatDate(DateTime date) {
    return DateFormat('MMM dd').format(date);
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return AppColors.success;
      case 'pending':
        return AppColors.warning;
      case 'overdue':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: _getStatusColor(installment.status).withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Center(
          child: Text(
            '${installment.installmentNumber}',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: _getStatusColor(installment.status),
            ),
          ),
        ),
      ),
      title: Text(
        _formatDate(installment.dueDate),
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),
      subtitle: Text(
        installment.status.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: _getStatusColor(installment.status),
        ),
      ),
      trailing: Text(
        _formatCurrency(installment.amount),
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.bold,
          color: _getStatusColor(installment.status),
        ),
      ),
    );
  }
}
