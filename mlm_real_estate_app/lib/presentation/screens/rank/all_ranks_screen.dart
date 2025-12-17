import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../core/widgets/custom_app_bar.dart';
import '../../../data/providers/rank_provider.dart';
import '../../../data/models/rank_model.dart';
import '../../../core/utils/currency_utils.dart';
import 'widgets/rank_badge_widget.dart';

/// All ranks list screen
///
/// Displays all available ranks with badges, requirements, benefits,
/// and locked/unlocked indicators
class AllRanksScreen extends StatefulWidget {
  const AllRanksScreen({super.key});

  @override
  State<AllRanksScreen> createState() => _AllRanksScreenState();
}

class _AllRanksScreenState extends State<AllRanksScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final rankProvider = context.read<RankProvider>();
    await Future.wait([
      rankProvider.fetchAllRanks(),
      rankProvider.fetchCurrentRank(),
    ]);
  }

  Future<void> _refreshData() async {
    await _loadData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'All Ranks',
      ),
      body: Consumer<RankProvider>(
        builder: (context, rankProvider, child) {
          if (rankProvider.isLoading && rankProvider.allRanks.isEmpty) {
            return const LoadingWidget();
          }

          if (rankProvider.errorMessage != null &&
              rankProvider.allRanks.isEmpty) {
            return custom_error.CustomErrorWidget(
              message: rankProvider.errorMessage!,
              onRetry: _refreshData,
            );
          }

          final ranks = rankProvider.allRanks;
          final currentRankId = rankProvider.currentRank?.id;

          return RefreshIndicator(
            onRefresh: _refreshData,
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: ranks.length,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final rank = ranks[index];
                final isCurrent = rank.id == currentRankId;
                final isUnlocked = currentRankId != null &&
                    rank.order <=
                        (rankProvider.currentRank?.order ?? 0);

                return _buildRankCard(rank, isCurrent, isUnlocked);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildRankCard(RankModel rank, bool isCurrent, bool isUnlocked) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCurrent ? AppColors.primary : AppColors.border,
          width: isCurrent ? 2 : 1,
        ),
        boxShadow: isCurrent
            ? [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Stack(
        children: [
          if (!isUnlocked)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.white.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    RankBadgeWidget(
                      rankName: rank.name,
                      size: RankBadgeSize.medium,
                      isLocked: !isUnlocked,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            rank.name,
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: isUnlocked
                                  ? AppColors.textPrimary
                                  : AppColors.textSecondary,
                            ),
                          ),
                          if (isCurrent) ...[
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                'CURRENT RANK',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.white,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    if (!isUnlocked)
                      const Icon(
                        Icons.lock,
                        color: AppColors.textTertiary,
                        size: 24,
                      )
                    else if (isUnlocked && !isCurrent)
                      const Icon(
                        Icons.check_circle,
                        color: AppColors.success,
                        size: 24,
                      ),
                  ],
                ),
                const SizedBox(height: 20),
                const Text(
                  'Requirements',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                _buildRequirementRow(
                  Icons.group_add,
                  'Direct Referrals',
                  '${rank.minDirectReferrals}',
                  isUnlocked,
                ),
                const SizedBox(height: 8),
                _buildRequirementRow(
                  Icons.people,
                  'Team Size',
                  '${rank.minTeamSize}',
                  isUnlocked,
                ),
                const SizedBox(height: 8),
                _buildRequirementRow(
                  Icons.business_center,
                  'Business Volume',
                  CurrencyUtils.formatCurrency(rank.minBusinessVolume),
                  isUnlocked,
                ),
                const SizedBox(height: 20),
                const Text(
                  'Benefits',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                ...rank.benefits.map((benefit) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.check_circle,
                          color: isUnlocked
                              ? AppColors.success
                              : AppColors.textTertiary,
                          size: 16,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            benefit,
                            style: TextStyle(
                              fontSize: 13,
                              color: isUnlocked
                                  ? AppColors.textPrimary
                                  : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRequirementRow(
    IconData icon,
    String label,
    String value,
    bool isUnlocked,
  ) {
    return Row(
      children: [
        Icon(
          icon,
          color: isUnlocked ? AppColors.primary : AppColors.textTertiary,
          size: 18,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              color:
                  isUnlocked ? AppColors.textSecondary : AppColors.textTertiary,
            ),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isUnlocked ? AppColors.textPrimary : AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
