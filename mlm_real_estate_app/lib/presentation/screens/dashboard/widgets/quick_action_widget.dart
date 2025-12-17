import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';

/// Quick action button widget
///
/// Displays an action button with icon and label
class QuickActionWidget extends StatelessWidget {
  final IconData icon;
  final String label;
  final Gradient? gradient;
  final Color? backgroundColor;
  final Color? iconColor;
  final Color? textColor;
  final VoidCallback onTap;

  const QuickActionWidget({
    required this.icon, required this.label, required this.onTap, super.key,
    this.gradient,
    this.backgroundColor,
    this.iconColor,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16.0),
        child: Container(
          decoration: BoxDecoration(
            gradient: gradient,
            color: gradient == null
                ? (backgroundColor ?? AppColors.surface)
                : null,
            borderRadius: BorderRadius.circular(16.0),
            border: gradient == null
                ? Border.all(
                    color: AppColors.border,
                    width: 1.0,
                  )
                : null,
            boxShadow: const [
              BoxShadow(
                color: AppColors.shadowLight,
                blurRadius: 8.0,
                offset: Offset(0, 2),
              ),
            ],
          ),
          padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 12.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12.0),
                decoration: BoxDecoration(
                  color: gradient != null
                      ? AppColors.white.withOpacity(0.2)
                      : (iconColor ?? AppColors.primary).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12.0),
                ),
                child: Icon(
                  icon,
                  color: gradient != null
                      ? AppColors.white
                      : (iconColor ?? AppColors.primary),
                  size: 28.0,
                ),
              ),
              const SizedBox(height: 12.0),
              Text(
                label,
                textAlign: TextAlign.center,
                style: theme.textTheme.labelMedium?.copyWith(
                  color: gradient != null
                      ? AppColors.white
                      : (textColor ?? AppColors.textPrimary),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
