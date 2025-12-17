import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../data/providers/kyc_provider.dart';
import '../../../data/models/kyc_document_model.dart';
import 'document_upload_screen.dart';
import 'widgets/kyc_status_banner_widget.dart';
import 'widgets/document_card_widget.dart';

/// KYC Screen - Know Your Customer verification status and document management
///
/// Displays KYC verification status, list of uploaded documents,
/// and provides options to upload or submit documents for verification.
class KycScreen extends StatefulWidget {
  const KycScreen({super.key});

  @override
  State<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends State<KycScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadKycStatus();
    });
  }

  Future<void> _loadKycStatus() async {
    final provider = context.read<KycProvider>();
    await provider.getKycStatus();
  }

  Future<void> _handleRefresh() async {
    await _loadKycStatus();
  }

  void _navigateToDocumentUpload() async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (context) => const DocumentUploadScreen(),
      ),
    );

    if (result == true) {
      _loadKycStatus();
    }
  }

  Future<void> _submitForVerification() async {
    final provider = context.read<KycProvider>();

    if (provider.documents.isEmpty) {
      _showMessage('Please upload at least one document before submitting');
      return;
    }

    final confirmed = await _showConfirmDialog(
      'Submit for Verification',
      'Are you sure you want to submit your documents for verification? You cannot modify them after submission.',
    );

    if (confirmed != true) return;

    final success = await provider.submitKyc({
      'submittedAt': DateTime.now().toIso8601String(),
    });

    if (success) {
      _showMessage('KYC submitted successfully for verification');
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
            child: const Text('Submit'),
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

  void _deleteDocument(KycDocumentModel document) async {
    final confirmed = await _showConfirmDialog(
      'Delete Document',
      'Are you sure you want to delete this document?',
    );

    if (confirmed != true) return;

    _showMessage('Document deletion coming soon');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('KYC Verification'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: Consumer<KycProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.kycStatus == null) {
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
            onRefresh: _handleRefresh,
            color: AppColors.primary,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  KycStatusBannerWidget(
                    status: provider.verificationStatus,
                    remarks: provider.kycStatus?['remarks'] as String?,
                  ),
                  const SizedBox(height: 24.0),
                  _buildRequirementsSection(),
                  const SizedBox(height: 24.0),
                  _buildDocumentsSection(provider),
                  const SizedBox(height: 24.0),
                  if (!provider.isVerified) _buildActionButtons(provider),
                  const SizedBox(height: 24.0),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildRequirementsSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12.0),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.info_outline,
                  color: AppColors.info,
                  size: 20.0,
                ),
                const SizedBox(width: 8.0),
                Text(
                  'KYC Requirements',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16.0),
            _buildRequirementItem('Valid government-issued ID (Aadhaar, PAN, Passport)'),
            const SizedBox(height: 8.0),
            _buildRequirementItem('Clear photo of document (both sides if applicable)'),
            const SizedBox(height: 8.0),
            _buildRequirementItem('Document should be valid and not expired'),
            const SizedBox(height: 8.0),
            _buildRequirementItem('All text should be clearly readable'),
          ],
        ),
      ),
    );
  }

  Widget _buildRequirementItem(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          margin: const EdgeInsets.only(top: 6.0),
          width: 6.0,
          height: 6.0,
          decoration: const BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 12.0),
        Expanded(
          child: Text(
            text,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
          ),
        ),
      ],
    );
  }

  Widget _buildDocumentsSection(KycProvider provider) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Uploaded Documents',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              if (!provider.isVerified && !provider.isPending)
                TextButton.icon(
                  onPressed: _navigateToDocumentUpload,
                  icon: const Icon(Icons.add, size: 20.0),
                  label: const Text('Add'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12.0),
          if (provider.documents.isEmpty)
            _buildEmptyState()
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: provider.documents.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12.0),
              itemBuilder: (context, index) {
                final document = provider.documents[index];
                return DocumentCardWidget(
                  document: document,
                  onTap: () => _viewDocument(document),
                  onDelete: provider.isVerified || provider.isPending
                      ? null
                      : () => _deleteDocument(document),
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(32.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: AppColors.border),
      ),
      child: Center(
        child: Column(
          children: [
            Icon(
              Icons.description_outlined,
              size: 64.0,
              color: AppColors.textSecondary.withOpacity(0.5),
            ),
            const SizedBox(height: 16.0),
            Text(
              'No Documents Uploaded',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8.0),
            Text(
              'Upload your documents to start verification',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24.0),
            ElevatedButton.icon(
              onPressed: _navigateToDocumentUpload,
              icon: const Icon(Icons.upload_file),
              label: const Text('Upload Document'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons(KycProvider provider) {
    if (provider.isPending) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: provider.documents.isEmpty ? null : _submitForVerification,
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12.0),
            ),
          ),
          child: provider.isLoading
              ? const SizedBox(
                  height: 20.0,
                  width: 20.0,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.0,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              : const Text('Submit for Verification'),
        ),
      ),
    );
  }

  void _viewDocument(KycDocumentModel document) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        padding: const EdgeInsets.all(24.0),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  document.documentType.toUpperCase(),
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16.0),
            _buildInfoRow('Document Number', document.documentNumber),
            const SizedBox(height: 8.0),
            _buildInfoRow('Status', document.status.toUpperCase()),
            if (document.remarks != null) ...[
              const SizedBox(height: 8.0),
              _buildInfoRow('Remarks', document.remarks!),
            ],
            const SizedBox(height: 16.0),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    if (document.documentFront.isNotEmpty)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12.0),
                        child: Image.network(
                          document.documentFront,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            height: 200.0,
                            color: AppColors.surfaceVariant,
                            child: const Center(
                              child: Icon(Icons.error_outline, size: 48.0),
                            ),
                          ),
                        ),
                      ),
                    if (document.documentBack != null && document.documentBack!.isNotEmpty) ...[
                      const SizedBox(height: 16.0),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12.0),
                        child: Image.network(
                          document.documentBack!,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            height: 200.0,
                            color: AppColors.surfaceVariant,
                            child: const Center(
                              child: Icon(Icons.error_outline, size: 48.0),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 120.0,
          child: Text(
            '$label:',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ),
      ],
    );
  }
}
