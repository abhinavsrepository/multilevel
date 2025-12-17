import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:local_auth/local_auth.dart';
import '../../../core/constants/color_constants.dart';
import '../../../data/providers/auth_provider.dart';
import 'notification_settings_screen.dart';
import 'widgets/settings_tile_widget.dart';
import 'widgets/theme_switch_widget.dart';

/// Settings Screen - Application settings and preferences
///
/// Displays profile, notification, security, theme, language settings,
/// and about section with logout functionality.
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final LocalAuthentication _localAuth = LocalAuthentication();
  bool _biometricEnabled = false;
  String _appVersion = '';

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    await _loadAppVersion();
    await _checkBiometricSupport();
  }

  Future<void> _loadAppVersion() async {
    final packageInfo = await PackageInfo.fromPlatform();
    setState(() {
      _appVersion = '${packageInfo.version} (${packageInfo.buildNumber})';
    });
  }

  Future<void> _checkBiometricSupport() async {
    try {
      final canCheckBiometrics = await _localAuth.canCheckBiometrics;
      final isDeviceSupported = await _localAuth.isDeviceSupported();
      setState(() {
        _biometricEnabled = canCheckBiometrics && isDeviceSupported;
      });
    } catch (e) {
      setState(() {
        _biometricEnabled = false;
      });
    }
  }

  void _navigateToNotificationSettings() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const NotificationSettingsScreen(),
      ),
    );
  }

  void _changePassword() {
    Navigator.pushNamed(context, '/change-password');
  }

  Future<void> _logout() async {
    final confirmed = await _showLogoutDialog();
    if (confirmed != true) return;

    if (!mounted) return;

    final authProvider = context.read<AuthProvider>();
    await authProvider.logout();

    if (mounted) {
      await Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    }
  }

  Future<bool?> _showLogoutDialog() {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildProfileSection(),
            const SizedBox(height: 8.0),
            _buildNotificationSection(),
            const SizedBox(height: 8.0),
            _buildSecuritySection(),
            const SizedBox(height: 8.0),
            _buildPreferencesSection(),
            const SizedBox(height: 8.0),
            _buildAboutSection(),
            const SizedBox(height: 8.0),
            _buildLogoutSection(),
            const SizedBox(height: 24.0),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileSection() {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    return Container(
      margin: const EdgeInsets.all(16.0),
      padding: const EdgeInsets.all(20.0),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(16.0),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 12.0,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 64.0,
            height: 64.0,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 8.0,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Center(
              child: Text(
                user?.fullName.substring(0, 1).toUpperCase() ?? 'U',
                style: const TextStyle(
                  fontSize: 28.0,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16.0),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?.fullName ?? 'User',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4.0),
                Text(
                  user?.email ?? '',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withValues(alpha: 0.9),
                      ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.edit, color: Colors.white),
            onPressed: () => Navigator.pushNamed(context, '/profile/edit'),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationSection() {
    return _buildSection(
      title: 'Notifications',
      children: [
        SettingsTileWidget(
          icon: Icons.notifications_outlined,
          title: 'Notification Settings',
          subtitle: 'Manage notification preferences',
          onTap: _navigateToNotificationSettings,
        ),
      ],
    );
  }

  Widget _buildSecuritySection() {
    return _buildSection(
      title: 'Security',
      children: [
        if (_biometricEnabled)
          SettingsTileWidget(
            icon: Icons.fingerprint,
            title: 'Biometric Authentication',
            subtitle: 'Use fingerprint or face ID',
            trailing: Switch(
              value: false,
              onChanged: (value) {
                _showMessage('Biometric authentication feature coming soon');
              },
              activeThumbColor: AppColors.primary,
            ),
          ),
        SettingsTileWidget(
          icon: Icons.lock_outline,
          title: 'Change Password',
          subtitle: 'Update your password',
          onTap: _changePassword,
        ),
        SettingsTileWidget(
          icon: Icons.security,
          title: 'Two-Factor Authentication',
          subtitle: 'Add an extra layer of security',
          trailing: Switch(
            value: false,
            onChanged: (value) {
              _showMessage('Two-factor authentication coming soon');
            },
            activeThumbColor: AppColors.primary,
          ),
        ),
      ],
    );
  }

  Widget _buildPreferencesSection() {
    return _buildSection(
      title: 'Preferences',
      children: [
        const ThemeSwitchWidget(),
        SettingsTileWidget(
          icon: Icons.language,
          title: 'Language',
          subtitle: 'English',
          onTap: () {
            _showMessage('Language selection coming soon');
          },
        ),
      ],
    );
  }

  Widget _buildAboutSection() {
    return _buildSection(
      title: 'About',
      children: [
        SettingsTileWidget(
          icon: Icons.info_outline,
          title: 'App Version',
          subtitle: _appVersion.isNotEmpty ? _appVersion : 'Loading...',
        ),
        SettingsTileWidget(
          icon: Icons.article_outlined,
          title: 'Terms & Conditions',
          onTap: () {
            Navigator.pushNamed(context, '/terms');
          },
        ),
        SettingsTileWidget(
          icon: Icons.privacy_tip_outlined,
          title: 'Privacy Policy',
          onTap: () {
            Navigator.pushNamed(context, '/privacy');
          },
        ),
        SettingsTileWidget(
          icon: Icons.help_outline,
          title: 'Help & Support',
          onTap: () {
            Navigator.pushNamed(context, '/support');
          },
        ),
      ],
    );
  }

  Widget _buildLogoutSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        children: [
          SettingsTileWidget(
            icon: Icons.logout,
            title: 'Logout',
            titleColor: AppColors.error,
            iconColor: AppColors.error,
            onTap: _logout,
          ),
        ],
      ),
    );
  }

  Widget _buildSection({required String title, required List<Widget> children}) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 8.0),
            child: Text(
              title,
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
          ...children.map((child) {
            final isLast = children.last == child;
            return Column(
              children: [
                child,
                if (!isLast)
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.0),
                    child: Divider(height: 1.0, color: AppColors.divider),
                  ),
              ],
            );
          }),
        ],
      ),
    );
  }
}
