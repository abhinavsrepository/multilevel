import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../data/models/kyc_document_model.dart';

/// Document Card Widget - Displays KYC document information
///
/// Shows document type, status, and provides options to view or delete.
class DocumentCardWidget extends StatelessWidget {
  final KycDocumentModel document;
  final VoidCallback? onTap;
  final VoidCallback? onDelete;

  const DocumentCardWidget({
    required this.document, super.key,
    this.onTap,
    this.onDelete,
  });

  IconData _getDocumentIcon() {
    switch (document.documentType.toLowerCase()) {
      case 'aadhaar':
        return Icons.credit_card;
      case 'pan':
        return Icons.badge;
      case 'passport':
        return Icons.menu_book;
      case 'driving_license':
        return Icons.drive_eta;
      case 'voter_id':
        return Icons.how_to_vote;
      default:
        return Icons.description;
    }
  }

  String _getDocumentName() {
    switch (document.documentType.toLowerCase()) {
      case 'aadhaar':
        return 'Aadhaar Card';
      case 'pan':
        return 'PAN Card';
      case 'passport':
        return 'Passport';
      case 'driving_license':
        return 'Driving License';
      case 'voter_id':
        return 'Voter ID';
      default:
        return document.documentType.toUpperCase();
    }
  }

  Color _getStatusColor() {
    switch (document.status.toLowerCase()) {
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

  Color _getStatusBackgroundColor() {
    switch (document.status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return AppColors.successBackground;
      case 'pending':
        return AppColors.warningBackground;
      case 'rejected':
        return AppColors.errorBackground;
      default:
        return AppColors.surfaceVariant;
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
        child: Row(
          children: [
            Container(
              width: 48.0,
              height: 48.0,
              decoration: BoxDecoration(
                color: AppColors.primaryExtraLight,
                borderRadius: BorderRadius.circular(8.0),
              ),
              child: Icon(
                _getDocumentIcon(),
                color: AppColors.primary,
                size: 24.0,
              ),
            ),
            const SizedBox(width: 16.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _getDocumentName(),
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    document.documentNumber,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12.0),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
                  decoration: BoxDecoration(
                    color: _getStatusBackgroundColor(),
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                  child: Text(
                    document.status.toUpperCase(),
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: _getStatusColor(),
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
                if (onDelete != null) ...[
                  const SizedBox(height: 8.0),
                  InkWell(
                    onTap: onDelete,
                    child: const Icon(
                      Icons.delete_outline,
                      color: AppColors.error,
                      size: 20.0,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}
