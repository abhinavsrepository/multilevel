import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/constants/color_constants.dart';
import '../../../data/providers/auth_provider.dart';
import 'widgets/profile_header_widget.dart';
import 'widgets/info_tile_widget.dart';

/// Profile screen displaying user information and menu options
///
/// Shows profile header, user info, stats, and menu items for various actions
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    if (user == null) {
      return const Scaffold(
        body: Center(
          child: Text('User not found'),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: ProfileHeaderWidget(
              user: user,
              onEditAvatar: () {
                Navigator.pushNamed(context, '/profile/edit');
              },
            ),
          ),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 24.0),
                _buildStatsRow(context, user),
                const SizedBox(height: 24.0),
                _buildSectionTitle(context, 'Personal Information'),
                const SizedBox(height: 12.0),
                _buildPersonalInfo(context, user),
                const SizedBox(height: 24.0),
                _buildSectionTitle(context, 'Referral QR Code'),
                const SizedBox(height: 12.0),
                _buildQRCode(context, user),
                const SizedBox(height: 24.0),
                _buildSectionTitle(context, 'Menu'),
                const SizedBox(height: 12.0),
                _buildMenuItems(context),
                const SizedBox(height: 24.0),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow(BuildContext context, user) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16.0),
      padding: const EdgeInsets.all(20.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(
          color: AppColors.border,
          width: 1.0,
        ),
        boxShadow: const [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 8.0,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildStatItem(
              context,
              Icons.people,
              'Team',
              '48',
              AppColors.info,
            ),
          ),
          Container(
            height: 40.0,
            width: 1.0,
            color: AppColors.divider,
          ),
          Expanded(
            child: _buildStatItem(
              context,
              Icons.account_balance_wallet,
              'Earnings',
              '₹125K',
              AppColors.success,
            ),
          ),
          Container(
            height: 40.0,
            width: 1.0,
            color: AppColors.divider,
          ),
          Expanded(
            child: _buildStatItem(
              context,
              Icons.trending_up,
              'Investments',
              '3',
              AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(
    BuildContext context,
    IconData icon,
    String label,
    String value,
    Color color,
  ) {
    final theme = Theme.of(context);

    return Column(
      children: [
        Icon(
          icon,
          color: color,
          size: 24.0,
        ),
        const SizedBox(height: 8.0),
        Text(
          value,
          style: theme.textTheme.titleLarge?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4.0),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Text(
        title,
        style: theme.textTheme.titleLarge?.copyWith(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildPersonalInfo(BuildContext context, user) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        children: [
          InfoTileWidget(
            icon: Icons.person,
            label: 'Full Name',
            value: user.fullName,
            iconColor: AppColors.primary,
          ),
          const SizedBox(height: 8.0),
          InfoTileWidget(
            icon: Icons.email,
            label: 'Email',
            value: user.email,
            iconColor: AppColors.info,
            showCopyButton: true,
          ),
          const SizedBox(height: 8.0),
          InfoTileWidget(
            icon: Icons.phone,
            label: 'Mobile',
            value: user.mobile,
            iconColor: AppColors.success,
            showCopyButton: true,
          ),
          const SizedBox(height: 8.0),
          InfoTileWidget(
            icon: Icons.badge,
            label: 'User ID',
            value: user.userId,
            iconColor: AppColors.secondary,
            showCopyButton: true,
          ),
        ],
      ),
    );
  }

  Widget _buildQRCode(BuildContext context, user) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16.0),
      padding: const EdgeInsets.all(20.0),
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
          Container(
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(12.0),
            ),
            child: QrImageView(
              data: 'MLM_REFERRAL_${user.userId}',
              version: QrVersions.auto,
              size: 200.0,
              backgroundColor: AppColors.white,
            ),
          ),
          const SizedBox(height: 16.0),
          Text(
            'Scan to join my team',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          const SizedBox(height: 12.0),
          ElevatedButton.icon(
            onPressed: () {
              Share.share(
                'Join my MLM Real Estate team! Use my referral code: ${user.userId}\n\nDownload the app: https://example.com/app',
                subject: 'Join MLM Real Estate',
              );
            },
            icon: const Icon(Icons.share),
            label: const Text('Share Profile'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.white,
              padding: const EdgeInsets.symmetric(
                horizontal: 24.0,
                vertical: 12.0,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.0),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItems(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        children: [
          _buildMenuItem(
            context,
            Icons.edit,
            'Edit Profile',
            () => Navigator.pushNamed(context, '/profile/edit'),
            AppColors.primary,
          ),
          const SizedBox(height: 8.0),
          _buildMenuItem(
            context,
            Icons.credit_card,
            'Digital ID Card',
            () => Navigator.pushNamed(context, '/profile/digital-id'),
            AppColors.info,
          ),
          const SizedBox(height: 8.0),
          _buildMenuItem(
            context,
            Icons.lock,
            'Change Password',
            () => Navigator.pushNamed(context, '/profile/change-password'),
            AppColors.warning,
          ),
          const SizedBox(height: 8.0),
          _buildMenuItem(
            context,
            Icons.settings,
            'Settings',
            () => Navigator.pushNamed(context, '/settings'),
            AppColors.textSecondary,
          ),
          const SizedBox(height: 8.0),
          _buildMenuItem(
            context,
            Icons.logout,
            'Logout',
            () => _handleLogout(context),
            AppColors.error,
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context,
    IconData icon,
    String title,
    VoidCallback onTap,
    Color iconColor,
  ) {
    final theme = Theme.of(context);

    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(12.0),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12.0),
        child: Container(
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12.0),
            border: Border.all(
              color: AppColors.border,
              width: 1.0,
            ),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10.0),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10.0),
                ),
                child: Icon(
                  icon,
                  color: iconColor,
                  size: 20.0,
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: Text(
                  title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const Icon(
                Icons.chevron_right,
                color: AppColors.textTertiary,
                size: 20.0,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleLogout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      await context.read<AuthProvider>().logout();
      if (context.mounted) {
        Navigator.pushNamedAndRemoveUntil(
          context,
          '/login',
          (route) => false,
        );
      }
    }
  }
}
