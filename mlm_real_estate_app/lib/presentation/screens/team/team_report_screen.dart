import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../core/widgets/custom_app_bar.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../data/providers/tree_provider.dart';
import '../../../core/utils/currency_utils.dart';

/// Team analytics and report screen
///
/// Displays team growth charts, business volume analysis,
/// level-wise breakdown, and export functionality
class TeamReportScreen extends StatefulWidget {
  const TeamReportScreen({super.key});

  @override
  State<TeamReportScreen> createState() => _TeamReportScreenState();
}

class _TeamReportScreenState extends State<TeamReportScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadReportData();
  }

  Future<void> _loadReportData() async {
    await context.read<TreeProvider>().getTeamStats();
  }

  Future<void> _refreshData() async {
    await _loadReportData();
  }

  void _exportReport() {
    final stats = context.read<TreeProvider>().teamStats ?? {};
    final reportText = '''
MLM Team Report

Total Members: ${stats['totalMembers'] ?? 0}
Active Members: ${stats['activeMembers'] ?? 0}
Team Business: ${CurrencyUtils.formatCurrency((stats['teamBusiness'] as num?)?.toDouble() ?? 0)}
Monthly Growth: ${stats['monthlyGrowth'] ?? 0}%

Generated on: ${DateTime.now()}
    ''';

    Share.share(reportText, subject: 'My Team Report');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Team Report',
        actions: [
          IconButton(
            icon: const Icon(Icons.file_download),
            onPressed: _exportReport,
            tooltip: 'Export Report',
          ),
        ],
      ),
      body: Consumer<TreeProvider>(
        builder: (context, treeProvider, child) {
          if (treeProvider.isLoading && treeProvider.teamStats == null) {
            return const LoadingWidget();
          }

          if (treeProvider.errorMessage != null &&
              treeProvider.teamStats == null) {
            return custom_error.CustomErrorWidget(
              message: treeProvider.errorMessage!,
              onRetry: _refreshData,
            );
          }

          return RefreshIndicator(
            onRefresh: _refreshData,
            child: Column(
              children: [
                _buildTabBar(),
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildGrowthTab(treeProvider),
                      _buildBusinessTab(treeProvider),
                      _buildLevelTab(treeProvider),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: _buildExportButton(),
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
          Tab(text: 'Growth'),
          Tab(text: 'Business'),
          Tab(text: 'Levels'),
        ],
      ),
    );
  }

  Widget _buildGrowthTab(TreeProvider treeProvider) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Team Size Growth',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          _buildGrowthChart(),
          const SizedBox(height: 24),
          _buildGrowthStats(treeProvider),
        ],
      ),
    );
  }

  Widget _buildGrowthChart() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          SizedBox(
            height: 250,
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  horizontalInterval: 10,
                  getDrawingHorizontalLine: (value) {
                    return const FlLine(
                      color: AppColors.border,
                      strokeWidth: 1,
                    );
                  },
                ),
                titlesData: FlTitlesData(
                  show: true,
                  rightTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  topTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        const months = [
                          'Jan',
                          'Feb',
                          'Mar',
                          'Apr',
                          'May',
                          'Jun',
                          'Jul',
                          'Aug',
                          'Sep',
                          'Oct',
                          'Nov',
                          'Dec'
                        ];
                        if (value.toInt() >= 0 &&
                            value.toInt() < months.length) {
                          return Text(
                            months[value.toInt()],
                            style: const TextStyle(
                              fontSize: 10,
                              color: AppColors.textSecondary,
                            ),
                          );
                        }
                        return const Text('');
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40,
                      getTitlesWidget: (value, meta) {
                        return Text(
                          value.toInt().toString(),
                          style: const TextStyle(
                            fontSize: 10,
                            color: AppColors.textSecondary,
                          ),
                        );
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: const [
                      FlSpot(0, 10),
                      FlSpot(1, 15),
                      FlSpot(2, 20),
                      FlSpot(3, 25),
                      FlSpot(4, 30),
                      FlSpot(5, 38),
                      FlSpot(6, 42),
                      FlSpot(7, 45),
                      FlSpot(8, 48),
                      FlSpot(9, 52),
                      FlSpot(10, 58),
                      FlSpot(11, 65),
                    ],
                    isCurved: true,
                    color: AppColors.primary,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: true),
                    belowBarData: BarAreaData(
                      show: true,
                      color: AppColors.primary.withOpacity(0.1),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGrowthStats(TreeProvider treeProvider) {
    final stats = treeProvider.teamStats ?? {};

    return Column(
      children: [
        _buildStatCard(
          'Total Members',
          (stats['totalMembers'] ?? 0).toString(),
          Icons.people,
          AppColors.primary,
        ),
        const SizedBox(height: 12),
        _buildStatCard(
          'Active Members',
          (stats['activeMembers'] ?? 0).toString(),
          Icons.how_to_reg,
          AppColors.success,
        ),
        const SizedBox(height: 12),
        _buildStatCard(
          'Inactive Members',
          (stats['inactiveMembers'] ?? 0).toString(),
          Icons.person_off,
          AppColors.textSecondary,
        ),
      ],
    );
  }

  Widget _buildBusinessTab(TreeProvider treeProvider) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Business Volume',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          _buildBusinessChart(),
          const SizedBox(height: 24),
          _buildBusinessStats(treeProvider),
        ],
      ),
    );
  }

  Widget _buildBusinessChart() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: SizedBox(
        height: 250,
        child: BarChart(
          BarChartData(
            alignment: BarChartAlignment.spaceAround,
            maxY: 100000,
            barTouchData: BarTouchData(enabled: true),
            titlesData: FlTitlesData(
              show: true,
              rightTitles: const AxisTitles(
                sideTitles: SideTitles(showTitles: false),
              ),
              topTitles: const AxisTitles(
                sideTitles: SideTitles(showTitles: false),
              ),
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  getTitlesWidget: (value, meta) {
                    const months = ['J', 'F', 'M', 'A', 'M', 'J'];
                    if (value.toInt() >= 0 && value.toInt() < months.length) {
                      return Text(
                        months[value.toInt()],
                        style: const TextStyle(
                          fontSize: 10,
                          color: AppColors.textSecondary,
                        ),
                      );
                    }
                    return const Text('');
                  },
                ),
              ),
              leftTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 50,
                  getTitlesWidget: (value, meta) {
                    return Text(
                      '${(value / 1000).toInt()}K',
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textSecondary,
                      ),
                    );
                  },
                ),
              ),
            ),
            borderData: FlBorderData(show: false),
            gridData: const FlGridData(
              show: true,
              drawVerticalLine: false,
            ),
            barGroups: [
              BarChartGroupData(x: 0, barRods: [
                BarChartRodData(
                    toY: 45000, color: AppColors.primary, width: 16)
              ]),
              BarChartGroupData(x: 1, barRods: [
                BarChartRodData(
                    toY: 52000, color: AppColors.primary, width: 16)
              ]),
              BarChartGroupData(x: 2, barRods: [
                BarChartRodData(
                    toY: 58000, color: AppColors.primary, width: 16)
              ]),
              BarChartGroupData(x: 3, barRods: [
                BarChartRodData(
                    toY: 65000, color: AppColors.primary, width: 16)
              ]),
              BarChartGroupData(x: 4, barRods: [
                BarChartRodData(
                    toY: 72000, color: AppColors.primary, width: 16)
              ]),
              BarChartGroupData(x: 5, barRods: [
                BarChartRodData(
                    toY: 80000, color: AppColors.primary, width: 16)
              ]),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBusinessStats(TreeProvider treeProvider) {
    final stats = treeProvider.teamStats ?? {};
    final teamBusiness = (stats['teamBusiness'] as num?)?.toDouble() ?? 0.0;
    final personalBusiness =
        (stats['personalBusiness'] as num?)?.toDouble() ?? 0.0;
    final monthlyBusiness =
        (stats['monthlyBusiness'] as num?)?.toDouble() ?? 0.0;

    return Column(
      children: [
        _buildStatCard(
          'Total Business',
          CurrencyUtils.formatCurrency(teamBusiness),
          Icons.business_center,
          AppColors.primary,
        ),
        const SizedBox(height: 12),
        _buildStatCard(
          'Personal Business',
          CurrencyUtils.formatCurrency(personalBusiness),
          Icons.person,
          AppColors.secondary,
        ),
        const SizedBox(height: 12),
        _buildStatCard(
          'This Month',
          CurrencyUtils.formatCurrency(monthlyBusiness),
          Icons.calendar_today,
          AppColors.tertiary,
        ),
      ],
    );
  }

  Widget _buildLevelTab(TreeProvider treeProvider) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Level-wise Breakdown',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          _buildLevelPieChart(),
          const SizedBox(height: 24),
          _buildLevelList(),
        ],
      ),
    );
  }

  Widget _buildLevelPieChart() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: SizedBox(
        height: 250,
        child: PieChart(
          PieChartData(
            sections: [
              PieChartSectionData(
                value: 30,
                title: 'L1',
                color: AppColors.chart1,
                radius: 80,
                titleStyle: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.white,
                ),
              ),
              PieChartSectionData(
                value: 25,
                title: 'L2',
                color: AppColors.chart2,
                radius: 80,
                titleStyle: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.white,
                ),
              ),
              PieChartSectionData(
                value: 20,
                title: 'L3',
                color: AppColors.chart3,
                radius: 80,
                titleStyle: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.white,
                ),
              ),
              PieChartSectionData(
                value: 15,
                title: 'L4',
                color: AppColors.chart4,
                radius: 80,
                titleStyle: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.white,
                ),
              ),
              PieChartSectionData(
                value: 10,
                title: 'L5+',
                color: AppColors.chart5,
                radius: 80,
                titleStyle: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.white,
                ),
              ),
            ],
            sectionsSpace: 2,
            centerSpaceRadius: 40,
          ),
        ),
      ),
    );
  }

  Widget _buildLevelList() {
    final levels = [
      {'level': 'Level 1', 'members': 30, 'color': AppColors.chart1},
      {'level': 'Level 2', 'members': 25, 'color': AppColors.chart2},
      {'level': 'Level 3', 'members': 20, 'color': AppColors.chart3},
      {'level': 'Level 4', 'members': 15, 'color': AppColors.chart4},
      {'level': 'Level 5+', 'members': 10, 'color': AppColors.chart5},
    ];

    return Column(
      children: levels.map((level) {
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: level['color'] as Color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  level['level'] as String,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              Text(
                '${level['members']} members',
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildStatCard(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
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
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
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

  Widget _buildExportButton() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 4,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: CustomButton(
        text: 'Export Report',
        onPressed: _exportReport,
        leftIcon: Icons.file_download,
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}
