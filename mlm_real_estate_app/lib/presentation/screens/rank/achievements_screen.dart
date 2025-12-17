import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../core/widgets/custom_app_bar.dart';
import '../../../data/providers/rank_provider.dart';
import '../../../data/models/achievement_model.dart';
import 'widgets/achievement_card_widget.dart';

/// Achievements screen
///
/// Displays all achievements with locked/unlocked status,
/// achievement dates, and share functionality
class AchievementsScreen extends StatefulWidget {
  const AchievementsScreen({super.key});

  @override
  State<AchievementsScreen> createState() => _AchievementsScreenState();
}

class _AchievementsScreenState extends State<AchievementsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    await context.read<RankProvider>().fetchAchievements();
  }

  Future<void> _refreshData() async {
    await _loadData();
  }

  void _shareAchievement(AchievementModel achievement) {
    final text = '''
I just unlocked the "${achievement.name}" achievement!

${achievement.description}

Points earned: ${achievement.points}
Date: ${achievement.unlockedAt?.toString().split(' ')[0]}
    ''';

    Share.share(text, subject: 'My Achievement');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Achievements',
      ),
      body: Consumer<RankProvider>(
        builder: (context, rankProvider, child) {
          if (rankProvider.isLoading && rankProvider.achievements.isEmpty) {
            return const LoadingWidget();
          }

          if (rankProvider.errorMessage != null &&
              rankProvider.achievements.isEmpty) {
            return custom_error.CustomErrorWidget(
              message: rankProvider.errorMessage!,
              onRetry: _refreshData,
            );
          }

          return Column(
            children: [
              _buildStatsHeader(rankProvider),
              _buildTabBar(),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildAchievementsList(
                      rankProvider.unlockedAchievements,
                      isUnlocked: true,
                    ),
                    _buildAchievementsList(
                      rankProvider.lockedAchievements,
                      isUnlocked: false,
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildStatsHeader(RankProvider rankProvider) {
    final unlockedCount = rankProvider.unlockedAchievements.length;
    final totalCount = rankProvider.achievements.length;
    final totalPoints = rankProvider.unlockedAchievements
        .fold<int>(0, (sum, achievement) => sum + achievement.points);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        gradient: AppColors.primaryGradient,
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildStatItem(
              'Unlocked',
              '$unlockedCount / $totalCount',
              Icons.emoji_events,
            ),
          ),
          Container(
            width: 1,
            height: 40,
            color: AppColors.white.withOpacity(0.3),
          ),
          Expanded(
            child: _buildStatItem(
              'Total Points',
              totalPoints.toString(),
              Icons.stars,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(
          icon,
          color: AppColors.white,
          size: 24,
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.white,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: AppColors.white.withOpacity(0.9),
          ),
        ),
      ],
    );
  }

  Widget _buildTabBar() {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: TabBar(
        controller: _tabController,
        labelColor: AppColors.primary,
        unselectedLabelColor: AppColors.textSecondary,
        indicatorColor: AppColors.primary,
        tabs: const [
          Tab(
            icon: Icon(Icons.lock_open),
            text: 'Unlocked',
          ),
          Tab(
            icon: Icon(Icons.lock),
            text: 'Locked',
          ),
        ],
      ),
    );
  }

  Widget _buildAchievementsList(
    List<AchievementModel> achievements, {
    required bool isUnlocked,
  }) {
    if (achievements.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isUnlocked ? Icons.emoji_events : Icons.lock,
              size: 64,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: 16),
            Text(
              isUnlocked
                  ? 'No achievements unlocked yet'
                  : 'All achievements unlocked!',
              style: const TextStyle(
                fontSize: 16,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _refreshData,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: achievements.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final achievement = achievements[index];
          return AchievementCardWidget(
            achievement: achievement,
            onShare: isUnlocked ? () => _shareAchievement(achievement) : null,
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}
