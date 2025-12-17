import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../data/models/user_model.dart';
import '../../../../core/utils/currency_utils.dart';
import '../../../../core/extensions/date_extensions.dart';

/// Member card widget
///
/// Displays team member information in a card format with avatar,
/// name, userId, rank badge, joining date, business volume, and action button
class MemberCardWidget extends StatelessWidget {
  final UserModel member;
  final VoidCallback? onViewDetails;

  const MemberCardWidget({
    required this.member, super.key,
    this.onViewDetails,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
        boxShadow: const [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _buildAvatar(),
              const SizedBox(width: 12),
              Expanded(
                child: _buildMemberInfo(),
              ),
              _buildRankBadge(),
            ],
          ),
          const SizedBox(height: 16),
          _buildStats(),
          const SizedBox(height: 12),
          _buildActionButton(context),
        ],
      ),
    );
  }

  Widget _buildAvatar() {
    return Stack(
      children: [
        CircleAvatar(
          radius: 28,
          backgroundColor: AppColors.primaryLight,
          backgroundImage: member.profilePicture != null
              ? NetworkImage(member.profilePicture!)
              : null,
          child: member.profilePicture == null
              ? Text(
                  member.fullName[0].toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                )
              : null,
        ),
        Positioned(
          right: 0,
          bottom: 0,
          child: Container(
            width: 14,
            height: 14,
            decoration: BoxDecoration(
              color: member.status.toLowerCase() == 'active'
                  ? AppColors.success
                  : AppColors.textTertiary,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.white, width: 2),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMemberInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          member.fullName,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 4),
        Text(
          'ID: ${member.userId}',
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          'Joined ${member.createdAt.timeAgo()}',
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textTertiary,
          ),
        ),
      ],
    );
  }

  Widget _buildRankBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.getRankColor(member.rank).withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: AppColors.getRankColor(member.rank).withOpacity(0.3),
        ),
      ),
      child: Column(
        children: [
          Icon(
            Icons.military_tech,
            color: AppColors.getRankColor(member.rank),
            size: 18,
          ),
          const SizedBox(height: 2),
          Text(
            member.rank,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: AppColors.getRankColor(member.rank),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStats() {
    return Row(
      children: [
        Expanded(
          child: _buildStatItem(
            Icons.business_center,
            'Business',
            CurrencyUtils.formatCurrency(member.totalInvestment),
          ),
        ),
        Container(
          width: 1,
          height: 32,
          color: AppColors.border,
        ),
        Expanded(
          child: _buildStatItem(
            Icons.monetization_on,
            'Earnings',
            CurrencyUtils.formatCurrency(member.totalEarnings),
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem(IconData icon, String label, String value) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 14,
              color: AppColors.textSecondary,
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: onViewDetails ??
            () {
              _showMemberDetailsSheet(context);
            },
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: AppColors.primary),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.symmetric(vertical: 10),
        ),
        child: const Text(
          'View Details',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
          ),
        ),
      ),
    );
  }

  void _showMemberDetailsSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Member Details',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 20),
                  _buildDetailRow('Full Name', member.fullName),
                  const SizedBox(height: 12),
                  _buildDetailRow('User ID', member.userId),
                  const SizedBox(height: 12),
                  _buildDetailRow('Email', member.email),
                  const SizedBox(height: 12),
                  _buildDetailRow('Mobile', member.mobile),
                  const SizedBox(height: 12),
                  _buildDetailRow('Rank', member.rank),
                  const SizedBox(height: 12),
                  _buildDetailRow('Status', member.status.toUpperCase()),
                  const SizedBox(height: 12),
                  _buildDetailRow('KYC Status', member.kycStatus.toUpperCase()),
                  const SizedBox(height: 12),
                  _buildDetailRow(
                    'Total Investment',
                    CurrencyUtils.formatCurrency(member.totalInvestment),
                  ),
                  const SizedBox(height: 12),
                  _buildDetailRow(
                    'Total Earnings',
                    CurrencyUtils.formatCurrency(member.totalEarnings),
                  ),
                  const SizedBox(height: 12),
                  _buildDetailRow(
                    'Joined',
                    member.createdAt.formatDate(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(width: 16),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }
}
