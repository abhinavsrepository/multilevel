import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../core/widgets/custom_app_bar.dart';
import '../../../data/providers/tree_provider.dart';
import '../../../data/models/tree_node_model.dart';
import '../../../core/utils/currency_utils.dart';

/// Unilevel tree visualization screen
///
/// Displays the MLM unilevel tree structure with expandable levels
/// and level-based statistics
class UnilevelTreeScreen extends StatefulWidget {
  const UnilevelTreeScreen({super.key});

  @override
  State<UnilevelTreeScreen> createState() => _UnilevelTreeScreenState();
}

class _UnilevelTreeScreenState extends State<UnilevelTreeScreen> {
  final Map<String, bool> _expandedNodes = {};
  final Map<int, bool> _expandedLevels = {0: true};

  @override
  void initState() {
    super.initState();
    _loadUnilevelTree();
  }

  Future<void> _loadUnilevelTree() async {
    await context.read<TreeProvider>().getUnilevelTree();
  }

  Future<void> _refreshData() async {
    await _loadUnilevelTree();
  }

  void _toggleNodeExpanded(String nodeId) {
    setState(() {
      _expandedNodes[nodeId] = !(_expandedNodes[nodeId] ?? false);
    });
  }

  void _toggleLevelExpanded(int level) {
    setState(() {
      _expandedLevels[level] = !(_expandedLevels[level] ?? false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Unilevel Tree',
      ),
      body: Consumer<TreeProvider>(
        builder: (context, treeProvider, child) {
          if (treeProvider.isLoading && treeProvider.unilevelTree == null) {
            return const LoadingWidget();
          }

          if (treeProvider.errorMessage != null &&
              treeProvider.unilevelTree == null) {
            return custom_error.CustomErrorWidget(
              message: treeProvider.errorMessage!,
              onRetry: _refreshData,
            );
          }

          final unilevelTree = treeProvider.unilevelTree;
          if (unilevelTree == null) {
            return const Center(
              child: Text('No tree data available'),
            );
          }

          return RefreshIndicator(
            onRefresh: _refreshData,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLevelStats(unilevelTree),
                  const SizedBox(height: 24),
                  _buildTreeView(unilevelTree),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildLevelStats(TreeNodeModel rootNode) {
    final levelStats = _calculateLevelStats(rootNode);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Level Statistics',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          ...levelStats.entries.map((entry) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Level ${entry.key}',
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${entry.value} members',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Map<int, int> _calculateLevelStats(TreeNodeModel node) {
    final stats = <int, int>{};

    void traverse(TreeNodeModel? current) {
      if (current == null) return;

      stats[current.level] = (stats[current.level] ?? 0) + 1;

      if (current.leftChild != null) traverse(current.leftChild);
      if (current.rightChild != null) traverse(current.rightChild);
    }

    traverse(node);
    return stats;
  }

  Widget _buildTreeView(TreeNodeModel rootNode) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Network Structure',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        _buildNodeWithChildren(rootNode),
      ],
    );
  }

  Widget _buildNodeWithChildren(TreeNodeModel node) {
    final isExpanded = _expandedNodes[node.id] ?? false;
    final hasChildren =
        node.leftChild != null || node.rightChild != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          margin: EdgeInsets.only(left: node.level * 20.0),
          child: _buildNodeCard(node, hasChildren, isExpanded),
        ),
        if (isExpanded && hasChildren) ...[
          const SizedBox(height: 12),
          if (node.leftChild != null) _buildNodeWithChildren(node.leftChild!),
          if (node.rightChild != null)
            _buildNodeWithChildren(node.rightChild!),
        ],
      ],
    );
  }

  Widget _buildNodeCard(TreeNodeModel node, bool hasChildren, bool isExpanded) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: node.level == 0 ? AppColors.primary : AppColors.border,
          width: node.level == 0 ? 2 : 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: hasChildren ? () => _toggleNodeExpanded(node.id) : null,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.primaryLight,
                  backgroundImage: node.profilePicture != null
                      ? NetworkImage(node.profilePicture!)
                      : null,
                  child: node.profilePicture == null
                      ? Text(
                          node.userName[0].toUpperCase(),
                          style: const TextStyle(
                            color: AppColors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        node.userName,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text(
                            'ID: ${node.userId}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'L${node.level}',
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(
                            Icons.people,
                            size: 12,
                            color: AppColors.textTertiary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${node.teamSize}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Icon(
                            Icons.business_center,
                            size: 12,
                            color: AppColors.textTertiary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            CurrencyUtils.formatCurrency(node.businessVolume),
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.getRankColor(node.rank)
                            .withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        node.rank,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.getRankColor(node.rank),
                        ),
                      ),
                    ),
                    if (hasChildren) ...[
                      const SizedBox(height: 4),
                      Icon(
                        isExpanded
                            ? Icons.keyboard_arrow_up
                            : Icons.keyboard_arrow_down,
                        color: AppColors.textSecondary,
                        size: 20,
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
