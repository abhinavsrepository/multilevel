import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart' as custom_error;
import '../../../core/widgets/custom_app_bar.dart';
import '../../../core/widgets/empty_widget.dart';
import '../../../data/providers/tree_provider.dart';
import '../../../data/models/user_model.dart';
import 'widgets/member_card_widget.dart';

/// Direct referrals list screen
///
/// Displays list of directly referred users with filtering and pagination
class DirectReferralsScreen extends StatefulWidget {
  const DirectReferralsScreen({super.key});

  @override
  State<DirectReferralsScreen> createState() => _DirectReferralsScreenState();
}

class _DirectReferralsScreenState extends State<DirectReferralsScreen> {
  String _selectedFilter = 'all';
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadReferrals();
  }

  Future<void> _loadReferrals() async {
    await context.read<TreeProvider>().getDirectReferrals();
  }

  Future<void> _refreshData() async {
    await context.read<TreeProvider>().getDirectReferrals(refresh: true);
  }

  List<UserModel> _getFilteredReferrals(List<UserModel> allReferrals) {
    switch (_selectedFilter) {
      case 'active':
        return allReferrals
            .where((user) => user.status.toLowerCase() == 'active')
            .toList();
      case 'inactive':
        return allReferrals
            .where((user) => user.status.toLowerCase() != 'active')
            .toList();
      default:
        return allReferrals;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Direct Referrals',
      ),
      body: Consumer<TreeProvider>(
        builder: (context, treeProvider, child) {
          if (treeProvider.isLoading &&
              treeProvider.directReferrals.isEmpty) {
            return const LoadingWidget();
          }

          if (treeProvider.errorMessage != null &&
              treeProvider.directReferrals.isEmpty) {
            return custom_error.CustomErrorWidget(
              message: treeProvider.errorMessage!,
              onRetry: _refreshData,
            );
          }

          final filteredReferrals =
              _getFilteredReferrals(treeProvider.directReferrals);

          return Column(
            children: [
              _buildHeader(treeProvider.directReferrals.length),
              _buildFilterTabs(),
              Expanded(
                child: filteredReferrals.isEmpty
                    ? EmptyWidget(
                        title: 'No Referrals',
                        icon: Icons.people_outline,
                        description: _selectedFilter == 'all'
                            ? 'No referrals yet'
                            : 'No $_selectedFilter referrals',
                      )
                    : RefreshIndicator(
                        onRefresh: _refreshData,
                        child: ListView.separated(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(16),
                          itemCount: filteredReferrals.length,
                          separatorBuilder: (context, index) =>
                              const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final referral = filteredReferrals[index];
                            return MemberCardWidget(member: referral);
                          },
                        ),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHeader(int totalCount) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.primary,
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
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.group,
              color: AppColors.white,
              size: 32,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Total Referrals',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  totalCount.toString(),
                  style: const TextStyle(
                    fontSize: 28,
                    color: AppColors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTabs() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          _buildFilterChip('All', 'all'),
          const SizedBox(width: 8),
          _buildFilterChip('Active', 'active'),
          const SizedBox(width: 8),
          _buildFilterChip('Inactive', 'inactive'),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedFilter == value;

    return Expanded(
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _selectedFilter = value;
          });
        },
        backgroundColor: AppColors.surface,
        selectedColor: AppColors.primary,
        checkmarkColor: AppColors.white,
        labelStyle: TextStyle(
          color: isSelected ? AppColors.white : AppColors.textPrimary,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(
            color: isSelected ? AppColors.primary : AppColors.border,
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
}
