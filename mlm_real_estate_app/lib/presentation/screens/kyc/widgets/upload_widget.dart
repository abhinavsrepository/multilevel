import 'dart:io';
import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';

/// Upload Widget - Image picker with preview
///
/// Displays an upload button or preview of selected image with remove option.
class UploadWidget extends StatelessWidget {
  final String label;
  final File? imageFile;
  final VoidCallback onPickImage;
  final VoidCallback onRemove;

  const UploadWidget({
    required this.label, required this.onPickImage, required this.onRemove, super.key,
    this.imageFile,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
        ),
        const SizedBox(height: 8.0),
        if (imageFile == null)
          _buildUploadButton(context)
        else
          _buildPreview(context),
      ],
    );
  }

  Widget _buildUploadButton(BuildContext context) {
    return InkWell(
      onTap: onPickImage,
      borderRadius: BorderRadius.circular(8.0),
      child: Container(
        height: 120.0,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(8.0),
          border: Border.all(
            color: AppColors.border,
            style: BorderStyle.solid,
            width: 2.0,
          ),
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.cloud_upload_outlined,
                size: 40.0,
                color: AppColors.primary,
              ),
              const SizedBox(height: 8.0),
              Text(
                'Tap to upload',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPreview(BuildContext context) {
    return Container(
      height: 180.0,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(color: AppColors.border),
      ),
      child: Stack(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8.0),
            child: Image.file(
              imageFile!,
              width: double.infinity,
              height: double.infinity,
              fit: BoxFit.cover,
            ),
          ),
          Positioned(
            top: 8.0,
            right: 8.0,
            child: InkWell(
              onTap: onRemove,
              child: Container(
                padding: const EdgeInsets.all(8.0),
                decoration: BoxDecoration(
                  color: AppColors.error,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 4.0,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.close,
                  color: Colors.white,
                  size: 20.0,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
