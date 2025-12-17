import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../core/widgets/custom_app_bar.dart';
import '../../../data/providers/tree_provider.dart';
import '../../../data/models/tree_node_model.dart';
import 'widgets/tree_node_widget.dart';

/// Binary tree visualization screen
///
/// Displays the MLM binary tree structure with left and right positions,
/// supports zoom/pan, and shows empty positions
class BinaryTreeScreen extends StatefulWidget {
  const BinaryTreeScreen({super.key});

  @override
  State<BinaryTreeScreen> createState() => _BinaryTreeScreenState();
}

class _BinaryTreeScreenState extends State<BinaryTreeScreen> {
  final TransformationController _transformationController =
      TransformationController();
  TreeNodeModel? _selectedNode;

  @override
  void initState() {
    super.initState();
    _loadBinaryTree();
  }

  Future<void> _loadBinaryTree() async {
    await context.read<TreeProvider>().getBinaryTree();
  }

  Future<void> _refreshData() async {
    await _loadBinaryTree();
  }

  void _resetZoom() {
    _transformationController.value = Matrix4.identity();
  }

  void _showNodeDetails(TreeNodeModel node) {
    setState(() {
      _selectedNode = node;
    });

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildNodeDetailsSheet(node),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Binary Tree',
        actions: [
          IconButton(
            icon: const Icon(Icons.zoom_out_map),
            onPressed: _resetZoom,
            tooltip: 'Reset Zoom',
          ),
        ],
      ),
      body: Consumer<TreeProvider>(
        builder: (context, treeProvider, child) {
          if (treeProvider.isLoading && treeProvider.binaryTree == null) {
            return const LoadingWidget();
          }

          if (treeProvider.errorMessage != null &&
              treeProvider.binaryTree == null) {
            return custom_error.CustomErrorWidget(
              message: treeProvider.errorMessage!,
              onRetry: _refreshData,
            );
          }

          final binaryTree = treeProvider.binaryTree;
          if (binaryTree == null) {
            return const Center(
              child: Text('No tree data available'),
            );
          }

          return RefreshIndicator(
            onRefresh: _refreshData,
            child: InteractiveViewer(
              transformationController: _transformationController,
              boundaryMargin: const EdgeInsets.all(100),
              minScale: 0.5,
              maxScale: 3.0,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: _buildTreeView(binaryTree),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTreeView(TreeNodeModel rootNode) {
    return Column(
      children: [
        _buildTreeLevel([rootNode], 0),
      ],
    );
  }

  Widget _buildTreeLevel(List<TreeNodeModel?> nodes, int level) {
    if (nodes.isEmpty || nodes.every((node) => node == null)) {
      return const SizedBox.shrink();
    }

    final nextLevelNodes = <TreeNodeModel?>[];
    for (final node in nodes) {
      if (node != null) {
        nextLevelNodes.add(node.leftChild);
        nextLevelNodes.add(node.rightChild);
      } else {
        nextLevelNodes.add(null);
        nextLevelNodes.add(null);
      }
    }

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: nodes.map((node) {
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 8),
              child: node != null
                  ? TreeNodeWidget(
                      node: node,
                      onTap: () => _showNodeDetails(node),
                      isHighlighted: _selectedNode?.id == node.id,
                    )
                  : _buildEmptyNode(),
            );
          }).toList(),
        ),
        if (nextLevelNodes.any((node) => node != null)) ...[
          const SizedBox(height: 40),
          _buildTreeLevel(nextLevelNodes, level + 1),
        ],
      ],
    );
  }

  Widget _buildEmptyNode() {
    return Container(
      width: 80,
      height: 100,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.border,
          style: BorderStyle.solid,
          width: 2,
        ),
      ),
      child: const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.add_circle_outline,
            color: AppColors.textTertiary,
            size: 32,
          ),
          SizedBox(height: 4),
          Text(
            'Empty',
            style: TextStyle(
              fontSize: 10,
              color: AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNodeDetailsSheet(TreeNodeModel node) {
    return Container(
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
                Row(
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: AppColors.primaryLight,
                      backgroundImage: node.profilePicture != null
                          ? NetworkImage(node.profilePicture!)
                          : null,
                      child: node.profilePicture == null
                          ? Text(
                              node.userName[0].toUpperCase(),
                              style: const TextStyle(
                                color: AppColors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            )
                          : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            node.userName,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'ID: ${node.userId}',
                            style: const TextStyle(
                              fontSize: 14,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.getRankColor(node.rank)
                            .withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        node.rank,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.getRankColor(node.rank),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                _buildDetailRow('Position', node.position.toUpperCase()),
                const SizedBox(height: 12),
                _buildDetailRow('Level', node.level.toString()),
                const SizedBox(height: 12),
                _buildDetailRow('Team Size', node.teamSize.toString()),
                const SizedBox(height: 12),
                _buildDetailRow(
                  'Direct Referrals',
                  node.directReferrals.toString(),
                ),
                const SizedBox(height: 12),
                _buildDetailRow(
                  'Business Volume',
                  '\$${node.businessVolume.toStringAsFixed(2)}',
                ),
                const SizedBox(height: 12),
                _buildDetailRow('Status', node.status.toUpperCase()),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      // Navigate to user's tree
                      context.read<TreeProvider>().getBinaryTree(
                            userId: node.userId,
                          );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'View User Tree',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
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

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _transformationController.dispose();
    super.dispose();
  }
}
