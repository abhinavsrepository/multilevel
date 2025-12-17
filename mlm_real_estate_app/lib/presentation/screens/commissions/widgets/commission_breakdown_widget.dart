import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/currency_utils.dart';

/// Commission breakdown widget - Displays commission breakdown by type
///
/// Shows commission amounts and percentages for each commission type
class CommissionBreakdownWidget extends StatelessWidget {
  final Map<String, dynamic> earnings;

  const CommissionBreakdownWidget({
    required this.earnings, super.key,
  });

  @override
  Widget build(BuildContext context) {
    final commissionTypes = earnings['commissionTypes'] as Map<String, dynamic>? ?? {};
    final totalEarnings = (earnings['totalEarnings'] as num?)?.toDouble() ?? 0.0;

    if (commissionTypes.isEmpty) {
      return _buildEmptyState(context);
    }

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: AppColors.border),
        boxShadow: const [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 8.0,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: commissionTypes.entries.map((entry) {
          final amount = (entry.value as num).toDouble();
          final percentage = totalEarnings > 0 ? (amount / totalEarnings * 100) : 0.0;

          return _buildBreakdownItem(
            context,
            type: entry.key,
            amount: amount,
            percentage: percentage,
            isLast: entry.key == commissionTypes.keys.last,
          );
        }).toList(),
      ),
    );
  }

  Widget _buildBreakdownItem(
    BuildContext context, {
    required String type,
    required double amount,
    required double percentage,
    required bool isLast,
  }) {
    final theme = Theme.of(context);
    final typeColor = _getTypeColor(type);
    final typeIcon = _getTypeIcon(type);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8.0),
                decoration: BoxDecoration(
                  color: typeColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: Icon(
                  typeIcon,
                  color: typeColor,
                  size: 20.0,
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      type.toUpperCase(),
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4.0),
                    Row(
                      children: [
                        Expanded(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(4.0),
                            child: LinearProgressIndicator(
                              value: percentage / 100,
                              minHeight: 6.0,
                              backgroundColor: AppColors.border,
                              valueColor: AlwaysStoppedAnimation<Color>(typeColor),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8.0),
                        Text(
                          '${percentage.toStringAsFixed(1)}%',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12.0),
              Text(
                CurrencyUtils.formatINR(amount),
                style: theme.textTheme.titleMedium?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        if (!isLast) const Divider(height: 1.0),
      ],
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: AppColors.border),
      ),
      child: Center(
        child: Column(
          children: [
            const Icon(
              Icons.pie_chart_outline,
              size: 48.0,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: 12.0),
            Text(
              'No commission breakdown available',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getTypeColor(String type) {
    switch (type.toLowerCase()) {
      case 'direct':
        return AppColors.chart1;
      case 'level':
      case 'unilevel':
        return AppColors.chart2;
      case 'binary':
        return AppColors.chart3;
      case 'matching':
        return AppColors.chart4;
      case 'roi':
        return AppColors.chart5;
      default:
        return AppColors.chart6;
    }
  }

  IconData _getTypeIcon(String type) {
    switch (type.toLowerCase()) {
      case 'direct':
        return Icons.person_add;
      case 'level':
      case 'unilevel':
        return Icons.layers;
      case 'binary':
        return Icons.account_tree;
      case 'matching':
        return Icons.compare_arrows;
      case 'roi':
        return Icons.trending_up;
      default:
        return Icons.monetization_on;
    }
  }
}
