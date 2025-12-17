import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../core/constants/color_constants.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/theme_provider.dart';

/// App drawer widget providing navigation to various app sections
///
/// Shows user header, menu items, logout option, theme toggle, and version info
class AppDrawer extends StatefulWidget {
  const AppDrawer({super.key});

  @override
  State<AppDrawer> createState() => _AppDrawerState();
}

class _AppDrawerState extends State<AppDrawer> {
  String _appVersion = '';

  @override
  void initState() {
    super.initState();
    _loadAppVersion();
  }

  Future<void> _loadAppVersion() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      setState(() {
        _appVersion = '${packageInfo.version} (${packageInfo.buildNumber})';
      });
    } catch (e) {
      setState(() {
        _appVersion = '1.0.0';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = context.watch<AuthProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final user = authProvider.user;

    return Drawer(
      backgroundColor: AppColors.surface,
      child: SafeArea(
        child: Column(
          children: [
            _buildUserHeader(context, user),
            const SizedBox(height: 8.0),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _buildMenuItem(
                    context,
                    icon: Icons.dashboard,
                    title: 'Dashboard',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/dashboard');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: Icons.business,
                    title: 'Properties',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/properties');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: Icons.account_balance_wallet,
                    title: 'Investments',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/investments');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: Icons.people,
                    title: 'Team',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/team');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: Icons.monetization_on,
                    title: 'Commissions',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/commissions');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: Icons.account_balance,
                    title: 'Wallet',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/wallet');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: Icons.emoji_events,
                    title: 'Ranks & Achievements',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/ranks');
                    },
                  ),
                  const Divider(
                    height: 1.0,
                    thickness: 1.0,
                    color: AppColors.divider,
                  ),
                  _buildMenuItem(
                    context,
                    icon: Icons.group_add,
                    title: 'Referral',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/referral');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: Icons.notifications,
                    title: 'Notifications',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/notifications');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: Icons.support_agent,
                    title: 'Support',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/support');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: Icons.verified_user,
                    title: 'KYC Verification',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/kyc');
                    },
                  ),
                  const Divider(
                    height: 1.0,
                    thickness: 1.0,
                    color: AppColors.divider,
                  ),
                  _buildMenuItem(
                    context,
                    icon: Icons.settings,
                    title: 'Settings',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/settings');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: Icons.info,
                    title: 'About',
                    onTap: () {
                      Navigator.pop(context);
                      _showAboutDialog(context);
                    },
                  ),
                  _buildThemeToggle(context, themeProvider),
                ],
              ),
            ),
            const Divider(
              height: 1.0,
              thickness: 1.0,
              color: AppColors.divider,
            ),
            _buildMenuItem(
              context,
              icon: Icons.logout,
              title: 'Logout',
              iconColor: AppColors.error,
              textColor: AppColors.error,
              onTap: () => _handleLogout(context),
            ),
            const SizedBox(height: 8.0),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Version $_appVersion',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: AppColors.textTertiary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUserHeader(BuildContext context, user) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(20.0),
      decoration: const BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(20.0),
          bottomRight: Radius.circular(20.0),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 32.0,
                backgroundColor: AppColors.white,
                backgroundImage: user?.profilePicture != null
                    ? NetworkImage(user!.profilePicture!)
                    : null,
                child: user?.profilePicture == null
                    ? Text(
                        user?.fullName.substring(0, 1).toUpperCase() ?? 'U',
                        style: theme.textTheme.headlineMedium?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 16.0),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user?.fullName ?? 'User',
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      user?.email ?? '',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.white.withOpacity(0.9),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12.0),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 12.0,
              vertical: 6.0,
            ),
            decoration: BoxDecoration(
              color: AppColors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12.0),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.emoji_events,
                  color: AppColors.white,
                  size: 16.0,
                ),
                const SizedBox(width: 6.0),
                Text(
                  user?.rank.toUpperCase() ?? 'MEMBER',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: AppColors.white,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? iconColor,
    Color? textColor,
  }) {
    final theme = Theme.of(context);

    return ListTile(
      leading: Icon(
        icon,
        color: iconColor ?? AppColors.textPrimary,
        size: 24.0,
      ),
      title: Text(
        title,
        style: theme.textTheme.bodyMedium?.copyWith(
          color: textColor ?? AppColors.textPrimary,
          fontWeight: FontWeight.w500,
        ),
      ),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 20.0,
        vertical: 4.0,
      ),
    );
  }

  Widget _buildThemeToggle(BuildContext context, ThemeProvider themeProvider) {
    final theme = Theme.of(context);

    return ListTile(
      leading: Icon(
        themeProvider.isDarkMode ? Icons.dark_mode : Icons.light_mode,
        color: AppColors.textPrimary,
        size: 24.0,
      ),
      title: Text(
        'Dark Mode',
        style: theme.textTheme.bodyMedium?.copyWith(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: Switch(
        value: themeProvider.isDarkMode,
        onChanged: (value) {
          themeProvider.toggleTheme();
        },
        activeThumbColor: AppColors.primary,
      ),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 20.0,
        vertical: 4.0,
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'MLM Real Estate',
      applicationVersion: _appVersion,
      applicationIcon: const Icon(
        Icons.business,
        size: 48.0,
        color: AppColors.primary,
      ),
      applicationLegalese: '© 2024 MLM Real Estate Platform',
      children: [
        const SizedBox(height: 16.0),
        const Text(
          'A comprehensive multi-level marketing platform for real estate investments.',
        ),
      ],
    );
  }

  Future<void> _handleLogout(BuildContext context) async {
    Navigator.pop(context);

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
            style: TextButton.styleFrom(
              foregroundColor: AppColors.error,
            ),
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
