import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../core/widgets/custom_app_bar.dart';
import '../../../data/providers/rank_provider.dart';
import '../../../core/utils/currency_utils.dart';
import 'widgets/progress_bar_widget.dart';

/// Rank progress screen
///
/// Shows detailed progress towards next rank with progress bars for
/// each requirement (direct referrals, team size, business volume)
class RankProgressScreen extends StatefulWidget {
  const RankProgressScreen({super.key});

  @override
  State<RankProgressScreen> createState() => _RankProgressScreenState();
}

class _RankProgressScreenState extends State<RankProgressScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final rankProvider = context.read<RankProvider>();
    await Future.wait([
      rankProvider.fetchCurrentRank(),
      rankProvider.fetchRankProgress(),
      rankProvider.fetchAllRanks(),
    ]);
  }

  Future<void> _refreshData() async {
    await _loadData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Rank Progress',
      ),
      body: Consumer<RankProvider>(
        builder: (context, rankProvider, child) {
          if (rankProvider.isLoading && rankProvider.rankProgress == null) {
            return const LoadingWidget();
          }

          if (rankProvider.errorMessage != null &&
              rankProvider.rankProgress == null) {
            return custom_error.CustomErrorWidget(
              message: rankProvider.errorMessage!,
              onRetry: _refreshData,
            );
          }

          final currentRank = rankProvider.currentRank;
          final nextRank = rankProvider.nextRank;
          final progress = rankProvider.rankProgress ?? {};

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
                  _buildProgressOverview(rankProvider),
                  const SizedBox(height: 24),
                  _buildCurrentNextRank(currentRank, nextRank),
                  const SizedBox(height: 24),
                  if (nextRank != null) ...[
                    const Text(
                      'Requirements Progress',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildDirectReferralsProgress(progress, nextRank),
                    const SizedBox(height: 16),
                    _buildTeamSizeProgress(progress, nextRank),
                    const SizedBox(height: 16),
                    _buildBusinessVolumeProgress(progress, nextRank),
                    const SizedBox(height: 24),
                    _buildMissingRequirements(progress, nextRank),
                  ] else
                    _buildMaxRankAchieved(),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildProgressOverview(RankProvider rankProvider) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          const Text(
            'Overall Progress',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: 120,
            height: 120,
            child: Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 120,
                  height: 120,
                  child: CircularProgressIndicator(
                    value: rankProvider.progressToNextRank / 100,
                    strokeWidth: 10,
                    backgroundColor: AppColors.white.withOpacity(0.3),
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AppColors.white,
                    ),
                  ),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${rankProvider.progressToNextRank.toStringAsFixed(0)}%',
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: AppColors.white,
                      ),
                    ),
                    const Text(
                      'Complete',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.white,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentNextRank(currentRank, nextRank) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              children: [
                const Text(
                  'Current Rank',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color:
                        AppColors.getRankColor(currentRank.name).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    currentRank.name,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.getRankColor(currentRank.name),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Icon(
            Icons.arrow_forward,
            color: AppColors.textSecondary,
          ),
          Expanded(
            child: Column(
              children: [
                const Text(
                  'Next Rank',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: nextRank != null
                        ? AppColors.getRankColor(nextRank.name).withOpacity(0.1)
                        : AppColors.border,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    nextRank?.name ?? 'Max',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: nextRank != null
                          ? AppColors.getRankColor(nextRank.name)
                          : AppColors.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDirectReferralsProgress(progress, nextRank) {
    final current = progress['currentDirectReferrals'] ?? 0;
    final target = nextRank.minDirectReferrals;
    final isCompleted = current >= target;

    return _buildProgressCard(
      icon: Icons.group_add,
      title: 'Direct Referrals',
      current: current.toDouble(),
      target: target.toDouble(),
      currentText: current.toString(),
      targetText: target.toString(),
      isCompleted: isCompleted,
    );
  }

  Widget _buildTeamSizeProgress(progress, nextRank) {
    final current = progress['currentTeamSize'] ?? 0;
    final target = nextRank.minTeamSize;
    final isCompleted = current >= target;

    return _buildProgressCard(
      icon: Icons.people,
      title: 'Team Size',
      current: current.toDouble(),
      target: target.toDouble(),
      currentText: current.toString(),
      targetText: target.toString(),
      isCompleted: isCompleted,
    );
  }

  Widget _buildBusinessVolumeProgress(progress, nextRank) {
    final current = (progress['currentBusinessVolume'] ?? 0).toDouble();
    final target = nextRank.minBusinessVolume;
    final isCompleted = current >= target;

    return _buildProgressCard(
      icon: Icons.business_center,
      title: 'Business Volume',
      current: current,
      target: target,
      currentText: CurrencyUtils.formatCurrency(current),
      targetText: CurrencyUtils.formatCurrency(target),
      isCompleted: isCompleted,
    );
  }

  Widget _buildProgressCard({
    required IconData icon,
    required String title,
    required double current,
    required double target,
    required String currentText,
    required String targetText,
    required bool isCompleted,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCompleted ? AppColors.success : AppColors.border,
          width: isCompleted ? 2 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: (isCompleted ? AppColors.success : AppColors.primary)
                      .withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  color: isCompleted ? AppColors.success : AppColors.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              if (isCompleted)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.success.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.check_circle,
                        color: AppColors.success,
                        size: 16,
                      ),
                      SizedBox(width: 4),
                      Text(
                        'Completed',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          ProgressBarWidget(
            current: current,
            target: target,
            color: isCompleted ? AppColors.success : AppColors.primary,
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Current: $currentText',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
              Text(
                'Target: $targetText',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMissingRequirements(progress, nextRank) {
    final missing = <String>[];

    if ((progress['currentDirectReferrals'] ?? 0) <
        nextRank.minDirectReferrals) {
      final diff = nextRank.minDirectReferrals -
          (progress['currentDirectReferrals'] ?? 0);
      missing.add('$diff more direct referrals');
    }

    if ((progress['currentTeamSize'] ?? 0) < nextRank.minTeamSize) {
      final diff = nextRank.minTeamSize - (progress['currentTeamSize'] ?? 0);
      missing.add('$diff more team members');
    }

    if ((progress['currentBusinessVolume'] ?? 0) <
        nextRank.minBusinessVolume) {
      final diff = nextRank.minBusinessVolume -
          (progress['currentBusinessVolume'] ?? 0);
      missing.add('${CurrencyUtils.formatCurrency(diff)} more business volume');
    }

    if (missing.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.success.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.success),
        ),
        child: const Row(
          children: [
            Icon(
              Icons.celebration,
              color: AppColors.success,
              size: 32,
            ),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Congratulations!',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.success,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'You have met all requirements for the next rank!',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'What you need',
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
            color: AppColors.warning.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.warning),
          ),
          child: Column(
            children: missing.map((item) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.arrow_right,
                      color: AppColors.warning,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        item,
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

  Widget _buildMaxRankAchieved() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: AppColors.successGradient,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.emoji_events,
            color: AppColors.white,
            size: 64,
          ),
          const SizedBox(height: 16),
          const Text(
            'Maximum Rank Achieved!',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'You have reached the highest rank in our MLM system. Congratulations!',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.white.withOpacity(0.9),
            ),
          ),
        ],
      ),
    );
  }
}
