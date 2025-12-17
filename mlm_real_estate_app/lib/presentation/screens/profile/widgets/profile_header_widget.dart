import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../data/models/user_model.dart';

/// Profile header widget displaying user avatar and basic info
///
/// Shows avatar with edit button, name, userId, rank badge, and member since date
class ProfileHeaderWidget extends StatelessWidget {
  final UserModel user;
  final VoidCallback? onEditAvatar;
  final bool showEditButton;

  const ProfileHeaderWidget({
    required this.user, super.key,
    this.onEditAvatar,
    this.showEditButton = true,
  });

  Color _getRankColor(String rank) {
    return AppColors.getRankColor(rank);
  }

  IconData _getRankIcon(String rank) {
    switch (rank.toLowerCase()) {
      case 'bronze':
        return Icons.military_tech;
      case 'silver':
        return Icons.shield;
      case 'gold':
        return Icons.emoji_events;
      case 'platinum':
        return Icons.diamond;
      case 'diamond':
      case 'crown_diamond':
        return Icons.workspace_premium;
      default:
        return Icons.star;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(24.0),
      decoration: const BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(32.0),
          bottomRight: Radius.circular(32.0),
        ),
      ),
      child: Column(
        children: [
          Stack(
            children: [
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.white,
                    width: 4.0,
                  ),
                  boxShadow: const [
                    BoxShadow(
                      color: AppColors.shadowDark,
                      blurRadius: 16.0,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: CircleAvatar(
                  radius: 60.0,
                  backgroundColor: AppColors.white,
                  backgroundImage: user.profilePicture != null
                      ? CachedNetworkImageProvider(user.profilePicture!)
                      : null,
                  child: user.profilePicture == null
                      ? Text(
                          user.fullName.substring(0, 1).toUpperCase(),
                          style: theme.textTheme.displayLarge?.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        )
                      : null,
                ),
              ),
              if (showEditButton)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Material(
                    color: AppColors.white,
                    shape: const CircleBorder(),
                    elevation: 4.0,
                    child: InkWell(
                      onTap: onEditAvatar,
                      customBorder: const CircleBorder(),
                      child: Container(
                        padding: const EdgeInsets.all(8.0),
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.camera_alt,
                          color: AppColors.primary,
                          size: 20.0,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16.0),
          Text(
            user.fullName,
            style: theme.textTheme.headlineMedium?.copyWith(
              color: AppColors.white,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4.0),
          Text(
            'ID: ${user.userId}',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AppColors.white.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 12.0),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 16.0,
              vertical: 8.0,
            ),
            decoration: BoxDecoration(
              color: AppColors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20.0),
              border: Border.all(
                color: AppColors.white.withOpacity(0.3),
                width: 1.0,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  _getRankIcon(user.rank),
                  color: _getRankColor(user.rank),
                  size: 20.0,
                ),
                const SizedBox(width: 8.0),
                Text(
                  user.rank.toUpperCase(),
                  style: theme.textTheme.titleSmall?.copyWith(
                    color: AppColors.white,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8.0),
          Text(
            'Member since ${DateFormat('MMM yyyy').format(user.createdAt)}',
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.white.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }
}
