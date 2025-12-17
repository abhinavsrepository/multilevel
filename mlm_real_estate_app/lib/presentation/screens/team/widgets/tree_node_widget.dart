import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../data/models/tree_node_model.dart';

/// Tree node widget for displaying a user in the tree structure
///
/// Shows avatar, name, rank, position indicator, and status badge
class TreeNodeWidget extends StatelessWidget {
  final TreeNodeModel node;
  final VoidCallback? onTap;
  final bool isHighlighted;

  const TreeNodeWidget({
    required this.node, super.key,
    this.onTap,
    this.isHighlighted = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 80,
        decoration: BoxDecoration(
          color: isHighlighted
              ? AppColors.primary.withOpacity(0.1)
              : AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isHighlighted ? AppColors.primary : AppColors.border,
            width: isHighlighted ? 2 : 1,
          ),
          boxShadow: isHighlighted
              ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            _buildAvatar(),
            const SizedBox(height: 6),
            _buildName(),
            const SizedBox(height: 4),
            _buildRankBadge(),
            const SizedBox(height: 4),
            _buildPositionIndicator(),
            const SizedBox(height: 4),
            _buildStatusBadge(),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatar() {
    return CircleAvatar(
      radius: 24,
      backgroundColor: AppColors.primaryLight,
      backgroundImage:
          node.profilePicture != null ? NetworkImage(node.profilePicture!) : null,
      child: node.profilePicture == null
          ? Text(
              node.userName[0].toUpperCase(),
              style: const TextStyle(
                color: AppColors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            )
          : null,
    );
  }

  Widget _buildName() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Text(
        node.userName.split(' ').first,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        textAlign: TextAlign.center,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),
    );
  }

  Widget _buildRankBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.getRankColor(node.rank).withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        node.rank.substring(0, node.rank.length > 3 ? 3 : node.rank.length),
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w600,
          color: AppColors.getRankColor(node.rank),
        ),
      ),
    );
  }

  Widget _buildPositionIndicator() {
    if (node.position == 'root') {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: node.position == 'left'
            ? AppColors.info.withOpacity(0.1)
            : AppColors.secondary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            node.position == 'left'
                ? Icons.arrow_back
                : Icons.arrow_forward,
            size: 8,
            color: node.position == 'left'
                ? AppColors.info
                : AppColors.secondary,
          ),
          const SizedBox(width: 2),
          Text(
            node.position == 'left' ? 'L' : 'R',
            style: TextStyle(
              fontSize: 8,
              fontWeight: FontWeight.w600,
              color: node.position == 'left'
                  ? AppColors.info
                  : AppColors.secondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge() {
    final isActive = node.status.toLowerCase() == 'active';

    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        color: isActive ? AppColors.success : AppColors.textTertiary,
        shape: BoxShape.circle,
      ),
    );
  }
}
