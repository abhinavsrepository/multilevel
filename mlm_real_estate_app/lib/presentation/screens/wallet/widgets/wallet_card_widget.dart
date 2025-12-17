import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/currency_utils.dart';

/// Wallet card widget - Displays wallet balance information
///
/// Shows balance with icon and gradient background
class WalletCardWidget extends StatelessWidget {
  final String title;
  final double amount;
  final IconData icon;
  final Gradient gradient;
  final VoidCallback? onTap;
  final bool isSmall;

  const WalletCardWidget({
    required this.title, required this.amount, required this.icon, required this.gradient, super.key,
    this.onTap,
    this.isSmall = false,
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
          padding: EdgeInsets.all(isSmall ? 16.0 : 20.0),
          decoration: BoxDecoration(
            gradient: gradient,
            borderRadius: BorderRadius.circular(16.0),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 12.0,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(isSmall ? 8.0 : 10.0),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    child: Icon(
                      icon,
                      color: Colors.white,
                      size: isSmall ? 20.0 : 24.0,
                    ),
                  ),
                  const Spacer(),
                  if (!isSmall)
                    Icon(
                      Icons.arrow_forward_ios,
                      color: Colors.white.withOpacity(0.7),
                      size: 16.0,
                    ),
                ],
              ),
              SizedBox(height: isSmall ? 12.0 : 16.0),
              Text(
                title,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: Colors.white.withOpacity(0.9),
                  fontWeight: FontWeight.w500,
                ),
              ),
              SizedBox(height: isSmall ? 4.0 : 8.0),
              Text(
                CurrencyUtils.formatINR(amount),
                style: theme.textTheme.headlineMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: isSmall ? 22.0 : 28.0,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
