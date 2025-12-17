import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';

/// FAQ Tile Widget - Expandable FAQ item
///
/// Shows question and expandable answer with category tag.
class FaqTileWidget extends StatefulWidget {
  final String question;
  final String answer;
  final String category;

  const FaqTileWidget({
    required this.question, required this.answer, required this.category, super.key,
  });

  @override
  State<FaqTileWidget> createState() => _FaqTileWidgetState();
}

class _FaqTileWidgetState extends State<FaqTileWidget> {
  bool _isExpanded = false;

  String _getCategoryLabel() {
    switch (widget.category.toLowerCase()) {
      case 'general':
        return 'General';
      case 'investment':
        return 'Investment';
      case 'kyc':
        return 'KYC';
      case 'commission':
        return 'Commission';
      case 'withdrawal':
        return 'Withdrawal';
      default:
        return widget.category;
    }
  }

  Color _getCategoryColor() {
    switch (widget.category.toLowerCase()) {
      case 'general':
        return AppColors.info;
      case 'investment':
        return AppColors.primary;
      case 'kyc':
        return AppColors.warning;
      case 'commission':
        return AppColors.success;
      case 'withdrawal':
        return AppColors.secondary;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () {
              setState(() => _isExpanded = !_isExpanded);
            },
            borderRadius: BorderRadius.circular(12.0),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                          decoration: BoxDecoration(
                            color: _getCategoryColor().withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          child: Text(
                            _getCategoryLabel(),
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                  color: _getCategoryColor(),
                                  fontWeight: FontWeight.w600,
                                ),
                          ),
                        ),
                        const SizedBox(height: 8.0),
                        Text(
                          widget.question,
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12.0),
                  Icon(
                    _isExpanded ? Icons.expand_less : Icons.expand_more,
                    color: AppColors.textSecondary,
                  ),
                ],
              ),
            ),
          ),
          if (_isExpanded)
            Container(
              padding: const EdgeInsets.fromLTRB(16.0, 0, 16.0, 16.0),
              child: Text(
                widget.answer,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                      height: 1.6,
                    ),
              ),
            ),
        ],
      ),
    );
  }
}
