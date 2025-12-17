import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';

/// KYC Status Banner Widget - Displays KYC verification status
///
/// Shows a banner with appropriate color and icon based on verification status.
class KycStatusBannerWidget extends StatelessWidget {
  final String status;
  final String? remarks;

  const KycStatusBannerWidget({
    required this.status, super.key,
    this.remarks,
  });

  Color _getBackgroundColor() {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return AppColors.successBackground;
      case 'pending':
        return AppColors.warningBackground;
      case 'rejected':
        return AppColors.errorBackground;
      default:
        return AppColors.infoBackground;
    }
  }

  Color _getBorderColor() {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return AppColors.kycVerified;
      case 'pending':
        return AppColors.kycPending;
      case 'rejected':
        return AppColors.kycRejected;
      default:
        return AppColors.kycNotSubmitted;
    }
  }

  Color _getTextColor() {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return AppColors.kycVerified;
      case 'pending':
        return AppColors.kycPending;
      case 'rejected':
        return AppColors.kycRejected;
      default:
        return AppColors.kycNotSubmitted;
    }
  }

  IconData _getIcon() {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return Icons.verified_user;
      case 'pending':
        return Icons.pending_outlined;
      case 'rejected':
        return Icons.cancel_outlined;
      default:
        return Icons.info_outline;
    }
  }

  String _getTitle() {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return 'KYC Verified';
      case 'pending':
        return 'KYC Pending Verification';
      case 'rejected':
        return 'KYC Rejected';
      default:
        return 'KYC Not Submitted';
    }
  }

  String _getMessage() {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return 'Your KYC verification is complete. You can now access all features.';
      case 'pending':
        return 'Your KYC documents are under review. You will be notified once verified.';
      case 'rejected':
        return remarks ?? 'Your KYC documents were rejected. Please re-upload valid documents.';
      default:
        return 'Please submit your KYC documents to verify your account.';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: _getBackgroundColor(),
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(
          color: _getBorderColor(),
          width: 1.5,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            _getIcon(),
            color: _getTextColor(),
            size: 28.0,
          ),
          const SizedBox(width: 16.0),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _getTitle(),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: _getTextColor(),
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4.0),
                Text(
                  _getMessage(),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: _getTextColor().withOpacity(0.9),
                        height: 1.5,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
