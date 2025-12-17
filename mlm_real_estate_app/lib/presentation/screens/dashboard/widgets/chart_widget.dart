import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../../core/constants/color_constants.dart';

/// Chart widget displaying monthly earnings data
///
/// Shows line chart with touch interaction, grid lines, and legend
class ChartWidget extends StatefulWidget {
  final List<double> monthlyData;
  final List<String> months;
  final String title;
  final Color? lineColor;
  final bool showGrid;
  final bool showDots;

  const ChartWidget({
    required this.monthlyData, required this.months, super.key,
    this.title = 'Monthly Earnings',
    this.lineColor,
    this.showGrid = true,
    this.showDots = true,
  });

  @override
  State<ChartWidget> createState() => _ChartWidgetState();
}

class _ChartWidgetState extends State<ChartWidget> {
  int? touchedIndex;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final lineColor = widget.lineColor ?? AppColors.primary;

    if (widget.monthlyData.isEmpty) {
      return _buildEmptyState(theme);
    }

    final maxY = widget.monthlyData.reduce((a, b) => a > b ? a : b);
    final minY = widget.monthlyData.reduce((a, b) => a < b ? a : b);
    final range = maxY - minY;
    final upperBound = maxY + (range * 0.1);
    final lowerBound = minY > 0 ? 0.0 : minY - (range * 0.1);

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(
          color: AppColors.border,
          width: 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.title,
            style: theme.textTheme.titleMedium?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 20.0),
          SizedBox(
            height: 200.0,
            child: LineChart(
              LineChartData(
                lineTouchData: LineTouchData(
                  touchCallback: (FlTouchEvent event, LineTouchResponse? touchResponse) {
                    setState(() {
                      if (touchResponse == null ||
                          touchResponse.lineBarSpots == null ||
                          event is! FlTapUpEvent &&
                              event is! FlPanUpdateEvent) {
                        touchedIndex = null;
                        return;
                      }
                      touchedIndex = touchResponse.lineBarSpots!.first.spotIndex;
                    });
                  },
                  touchTooltipData: LineTouchTooltipData(
                    tooltipBgColor: AppColors.textPrimary,
                    tooltipRoundedRadius: 8.0,
                    getTooltipItems: (List<LineBarSpot> touchedSpots) {
                      return touchedSpots.map((LineBarSpot touchedSpot) {
                        return LineTooltipItem(
                          '₹${touchedSpot.y.toStringAsFixed(0)}',
                          const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 12.0,
                          ),
                        );
                      }).toList();
                    },
                  ),
                ),
                gridData: FlGridData(
                  show: widget.showGrid,
                  drawVerticalLine: false,
                  horizontalInterval: upperBound / 5,
                  getDrawingHorizontalLine: (value) {
                    return const FlLine(
                      color: AppColors.border,
                      strokeWidth: 1.0,
                      dashArray: [5, 5],
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
                      reservedSize: 30.0,
                      interval: 1,
                      getTitlesWidget: (double value, TitleMeta meta) {
                        final index = value.toInt();
                        if (index < 0 || index >= widget.months.length) {
                          return const SizedBox.shrink();
                        }
                        return Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text(
                            widget.months[index],
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: AppColors.textSecondary,
                              fontSize: 10.0,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40.0,
                      interval: upperBound / 5,
                      getTitlesWidget: (double value, TitleMeta meta) {
                        if (value == meta.max || value == meta.min) {
                          return const SizedBox.shrink();
                        }
                        return Text(
                          '₹${(value / 1000).toStringAsFixed(0)}k',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                            fontSize: 10.0,
                          ),
                        );
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(
                  show: true,
                  border: const Border(
                    bottom: BorderSide(
                      color: AppColors.border,
                      width: 1.0,
                    ),
                    left: BorderSide(
                      color: AppColors.border,
                      width: 1.0,
                    ),
                  ),
                ),
                minX: 0,
                maxX: (widget.monthlyData.length - 1).toDouble(),
                minY: lowerBound,
                maxY: upperBound,
                lineBarsData: [
                  LineChartBarData(
                    spots: widget.monthlyData
                        .asMap()
                        .entries
                        .map((e) => FlSpot(e.key.toDouble(), e.value))
                        .toList(),
                    isCurved: true,
                    color: lineColor,
                    barWidth: 3.0,
                    isStrokeCapRound: true,
                    dotData: FlDotData(
                      show: widget.showDots,
                      getDotPainter: (spot, percent, barData, index) {
                        return FlDotCirclePainter(
                          radius: touchedIndex == index ? 6.0 : 4.0,
                          color: AppColors.white,
                          strokeWidth: touchedIndex == index ? 3.0 : 2.0,
                          strokeColor: lineColor,
                        );
                      },
                    ),
                    belowBarData: BarAreaData(
                      show: true,
                      gradient: LinearGradient(
                        colors: [
                          lineColor.withOpacity(0.3),
                          lineColor.withOpacity(0.0),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
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

  Widget _buildEmptyState(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(
          color: AppColors.border,
          width: 1.0,
        ),
      ),
      child: Column(
        children: [
          Text(
            widget.title,
            style: theme.textTheme.titleMedium?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 40.0),
          const Icon(
            Icons.show_chart,
            size: 64.0,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: 16.0),
          Text(
            'No data available',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 40.0),
        ],
      ),
    );
  }
}
