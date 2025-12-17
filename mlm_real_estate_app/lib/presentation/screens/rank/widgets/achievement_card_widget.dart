import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../data/models/achievement_model.dart';
import '../../../../core/extensions/date_extensions.dart';

/// Achievement card widget
///
/// Displays achievement badge icon, title, description, date earned,
/// and locked/unlocked state with optional share functionality
class AchievementCardWidget extends StatelessWidget {
  final AchievementModel achievement;
  final VoidCallback? onShare;

  const AchievementCardWidget({
    required this.achievement, super.key,
    this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: achievement.isUnlocked
              ? _getCategoryColor()
              : AppColors.border,
          width: achievement.isUnlocked ? 2 : 1,
        ),
        boxShadow: achievement.isUnlocked
            ? [
                BoxShadow(
                  color: _getCategoryColor().withOpacity(0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Stack(
        children: [
          if (!achievement.isUnlocked)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.white.withOpacity(0.7),
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _buildBadgeIcon(),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            achievement.name,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: achievement.isUnlocked
                                  ? AppColors.textPrimary
                                  : AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: _getCategoryColor().withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              achievement.category.toUpperCase(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: _getCategoryColor(),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (achievement.isUnlocked && onShare != null)
                      IconButton(
                        icon: const Icon(Icons.share),
                        color: AppColors.primary,
                        onPressed: onShare,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  achievement.description,
                  style: TextStyle(
                    fontSize: 14,
                    color: achievement.isUnlocked
                        ? AppColors.textSecondary
                        : AppColors.textTertiary,
                  ),
                ),
                const SizedBox(height: 16),
                if (achievement.isUnlocked) ...[
                  _buildUnlockedInfo(),
                ] else ...[
                  _buildLockedInfo(),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBadgeIcon() {
    return Container(
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        gradient: achievement.isUnlocked
            ? LinearGradient(
                colors: [
                  _getCategoryColor(),
                  _getCategoryColor().withOpacity(0.7),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : LinearGradient(
                colors: [
                  AppColors.textTertiary,
                  AppColors.textTertiary.withOpacity(0.7),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
        shape: BoxShape.circle,
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(
            _getAchievementIcon(),
            color: AppColors.white,
            size: 32,
          ),
          if (!achievement.isUnlocked)
            Container(
              decoration: BoxDecoration(
                color: AppColors.black.withOpacity(0.5),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.lock,
                color: AppColors.white,
                size: 24,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildUnlockedInfo() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.success.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: AppColors.success.withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.check_circle,
            color: AppColors.success,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Unlocked',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.success,
                  ),
                ),
                if (achievement.unlockedAt != null)
                  Text(
                    achievement.unlockedAt!.formatDate(),
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.secondary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.stars,
                  color: AppColors.secondary,
                  size: 16,
                ),
                const SizedBox(width: 4),
                Text(
                  '${achievement.points}',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.secondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLockedInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Requirements:',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        ...achievement.requirements.map((requirement) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.radio_button_unchecked,
                  size: 16,
                  color: AppColors.textTertiary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    requirement,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 8),
        Row(
          children: [
            const Icon(
              Icons.stars,
              color: AppColors.textTertiary,
              size: 16,
            ),
            const SizedBox(width: 4),
            Text(
              '${achievement.points} points',
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Color _getCategoryColor() {
    switch (achievement.category.toLowerCase()) {
      case 'rank':
        return AppColors.primary;
      case 'sales':
        return AppColors.success;
      case 'team':
        return AppColors.tertiary;
      case 'investment':
        return AppColors.secondary;
      default:
        return AppColors.primary;
    }
  }

  IconData _getAchievementIcon() {
    switch (achievement.category.toLowerCase()) {
      case 'rank':
        return Icons.military_tech;
      case 'sales':
        return Icons.trending_up;
      case 'team':
        return Icons.groups;
      case 'investment':
        return Icons.account_balance_wallet;
      default:
        return Icons.emoji_events;
    }
  }
}
