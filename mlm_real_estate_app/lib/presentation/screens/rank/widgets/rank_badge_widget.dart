import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';

/// Size variants for rank badge
enum RankBadgeSize {
  small,
  medium,
  large,
}

/// Rank badge widget
///
/// Displays a rank badge with icon, name, and color gradient
class RankBadgeWidget extends StatelessWidget {
  final String rankName;
  final RankBadgeSize size;
  final bool isLocked;

  const RankBadgeWidget({
    required this.rankName, super.key,
    this.size = RankBadgeSize.medium,
    this.isLocked = false,
  });

  @override
  Widget build(BuildContext context) {
    final dimensions = _getDimensions();
    final color = AppColors.getRankColor(rankName);

    return Container(
      width: dimensions['containerSize'],
      height: dimensions['containerSize'],
      decoration: BoxDecoration(
        gradient: isLocked
            ? LinearGradient(
                colors: [
                  AppColors.textTertiary,
                  AppColors.textTertiary.withOpacity(0.7),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : LinearGradient(
                colors: [
                  color,
                  color.withOpacity(0.7),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: isLocked
                ? AppColors.shadowLight
                : color.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                _getRankIcon(),
                color: AppColors.white,
                size: dimensions['iconSize'],
              ),
              SizedBox(height: dimensions['spacing']),
              Text(
                rankName,
                style: TextStyle(
                  fontSize: dimensions['fontSize'],
                  fontWeight: FontWeight.bold,
                  color: AppColors.white,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
          if (isLocked)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.black.withOpacity(0.3),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.lock,
                  color: AppColors.white,
                  size: dimensions['iconSize'],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Map<String, double> _getDimensions() {
    switch (size) {
      case RankBadgeSize.small:
        return {
          'containerSize': 60.0,
          'iconSize': 24.0,
          'fontSize': 10.0,
          'spacing': 2.0,
        };
      case RankBadgeSize.medium:
        return {
          'containerSize': 80.0,
          'iconSize': 32.0,
          'fontSize': 12.0,
          'spacing': 4.0,
        };
      case RankBadgeSize.large:
        return {
          'containerSize': 120.0,
          'iconSize': 48.0,
          'fontSize': 16.0,
          'spacing': 8.0,
        };
    }
  }

  IconData _getRankIcon() {
    switch (rankName.toLowerCase()) {
      case 'bronze':
        return Icons.military_tech;
      case 'silver':
        return Icons.stars;
      case 'gold':
        return Icons.workspace_premium;
      case 'platinum':
        return Icons.diamond;
      case 'diamond':
        return Icons.diamond_outlined;
      case 'crown_diamond':
      case 'crowndiamond':
      case 'crown diamond':
        return Icons.emoji_events;
      default:
        return Icons.military_tech;
    }
  }
}
