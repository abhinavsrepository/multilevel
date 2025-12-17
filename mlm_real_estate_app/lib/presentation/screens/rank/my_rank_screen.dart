import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../core/widgets/custom_app_bar.dart';
import '../../../data/providers/rank_provider.dart';
import 'widgets/rank_badge_widget.dart';
import 'widgets/progress_bar_widget.dart';
import 'rank_progress_screen.dart';
import 'achievements_screen.dart';

/// My rank screen
///
/// Displays current rank badge, rank benefits, progress to next rank,
/// requirements checklist, and achievements
class MyRankScreen extends StatefulWidget {
  const MyRankScreen({super.key});

  @override
  State<MyRankScreen> createState() => _MyRankScreenState();
}

class _MyRankScreenState extends State<MyRankScreen> {
  @override
  void initState() {
    super.initState();
    _loadRankData();
  }

  Future<void> _loadRankData() async {
    final rankProvider = context.read<RankProvider>();
    await Future.wait([
      rankProvider.fetchCurrentRank(),
      rankProvider.fetchRankProgress(),
      rankProvider.fetchAchievements(),
    ]);
  }

  Future<void> _refreshData() async {
    await _loadRankData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'My Rank',
        automaticallyImplyLeading: false,
      ),
      body: Consumer<RankProvider>(
        builder: (context, rankProvider, child) {
          if (rankProvider.isLoading && rankProvider.currentRank == null) {
            return const LoadingWidget();
          }

          if (rankProvider.errorMessage != null &&
              rankProvider.currentRank == null) {
            return custom_error.CustomErrorWidget(
              message: rankProvider.errorMessage!,
              onRetry: _refreshData,
            );
          }

          final currentRank = rankProvider.currentRank;
          if (currentRank == null) {
            return const Center(
              child: Text('No rank data available'),
            );
          }

          return RefreshIndicator(
            onRefresh: _refreshData,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildCurrentRankSection(currentRank, rankProvider),
                  const SizedBox(height: 24),
                  _buildBenefitsSection(currentRank),
                  const SizedBox(height: 24),
                  _buildProgressSection(rankProvider),
                  const SizedBox(height: 24),
                  _buildRequirementsSection(rankProvider),
                  const SizedBox(height: 24),
                  _buildAchievementsSection(rankProvider),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCurrentRankSection(currentRank, RankProvider rankProvider) {
    final nextRank = rankProvider.nextRank;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.getRankColor(currentRank.name),
            AppColors.getRankColor(currentRank.name).withOpacity(0.7),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.getRankColor(currentRank.name).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          const Text(
            'Current Rank',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.white,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 16),
          RankBadgeWidget(
            rankName: currentRank.name,
            size: RankBadgeSize.large,
          ),
          const SizedBox(height: 16),
          if (nextRank != null) ...[
            const Divider(color: AppColors.white),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'Next Rank: ',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  nextRank.name,
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ProgressBarWidget(
              current: rankProvider.progressToNextRank,
              target: 100,
              label: 'Progress',
              color: AppColors.white,
            ),
          ] else
            const Text(
              'Highest Rank Achieved!',
              style: TextStyle(
                fontSize: 16,
                color: AppColors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildBenefitsSection(currentRank) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Rank Benefits',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: currentRank.benefits.map<Widget>((benefit) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 2),
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppColors.success.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check,
                        color: AppColors.success,
                        size: 16,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        benefit,
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildProgressSection(RankProvider rankProvider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Progress to Next Rank',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const RankProgressScreen(),
                  ),
                );
              },
              child: const Text('View Details'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              CircularProgressIndicator(
                value: rankProvider.progressToNextRank / 100,
                strokeWidth: 12,
                backgroundColor: AppColors.border,
                color: AppColors.primary,
              ),
              const SizedBox(height: 12),
              Text(
                '${rankProvider.progressToNextRank.toStringAsFixed(1)}% Complete',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRequirementsSection(RankProvider rankProvider) {
    final nextRank = rankProvider.nextRank;
    if (nextRank == null) {
      return const SizedBox.shrink();
    }

    final progress = rankProvider.rankProgress ?? {};

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Requirements',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        _buildRequirementItem(
          'Direct Referrals',
          progress['currentDirectReferrals'] ?? 0,
          nextRank.minDirectReferrals,
          Icons.group_add,
        ),
        const SizedBox(height: 12),
        _buildRequirementItem(
          'Team Size',
          progress['currentTeamSize'] ?? 0,
          nextRank.minTeamSize,
          Icons.people,
        ),
        const SizedBox(height: 12),
        _buildRequirementItem(
          'Business Volume',
          (progress['currentBusinessVolume'] ?? 0).toDouble(),
          nextRank.minBusinessVolume,
          Icons.business_center,
        ),
      ],
    );
  }

  Widget _buildRequirementItem(
    String label,
    dynamic current,
    dynamic target,
    IconData icon,
  ) {
    final isCompleted = current >= target;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCompleted ? AppColors.success : AppColors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                color: isCompleted ? AppColors.success : AppColors.textSecondary,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              Icon(
                isCompleted ? Icons.check_circle : Icons.pending,
                color: isCompleted ? AppColors.success : AppColors.textTertiary,
                size: 20,
              ),
            ],
          ),
          const SizedBox(height: 12),
          ProgressBarWidget(
            current: current is double ? current : current.toDouble(),
            target: target is double ? target : target.toDouble(),
            color: isCompleted ? AppColors.success : AppColors.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildAchievementsSection(RankProvider rankProvider) {
    final unlockedCount = rankProvider.unlockedAchievements.length;
    final totalCount = rankProvider.achievements.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Achievements',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const AchievementsScreen(),
                  ),
                );
              },
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.secondary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.emoji_events,
                  color: AppColors.secondary,
                  size: 32,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$unlockedCount / $totalCount Unlocked',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Keep going to unlock more!',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
