import 'package:flutter/material.dart';
import '../../../core/constants/color_constants.dart';
import '../../../core/services/local_storage_service.dart';

/// Notification Settings Screen - Notification preferences
///
/// Allows users to configure notification preferences including
/// push notifications, email notifications, and specific notification types.
class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends State<NotificationSettingsScreen> {
  final LocalStorageService _storage = LocalStorageService.instance;

  bool _notificationsEnabled = true;
  bool _pushNotifications = true;
  bool _emailNotifications = true;
  bool _soundEnabled = true;
  bool _vibrationEnabled = true;

  bool _investmentNotifications = true;
  bool _commissionNotifications = true;
  bool _teamNotifications = true;
  bool _payoutNotifications = true;
  bool _kycNotifications = true;
  bool _promotionalNotifications = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    setState(() {
      _notificationsEnabled = _storage.getPreference<bool>(
            'notifications_enabled',
            defaultValue: true,
          ) ??
          true;
      _pushNotifications = _storage.getPreference<bool>(
            'push_notifications',
            defaultValue: true,
          ) ??
          true;
      _emailNotifications = _storage.getPreference<bool>(
            'email_notifications',
            defaultValue: true,
          ) ??
          true;
      _soundEnabled = _storage.getPreference<bool>(
            'sound_enabled',
            defaultValue: true,
          ) ??
          true;
      _vibrationEnabled = _storage.getPreference<bool>(
            'vibration_enabled',
            defaultValue: true,
          ) ??
          true;
      _investmentNotifications = _storage.getPreference<bool>(
            'investment_notifications',
            defaultValue: true,
          ) ??
          true;
      _commissionNotifications = _storage.getPreference<bool>(
            'commission_notifications',
            defaultValue: true,
          ) ??
          true;
      _teamNotifications = _storage.getPreference<bool>(
            'team_notifications',
            defaultValue: true,
          ) ??
          true;
      _payoutNotifications = _storage.getPreference<bool>(
            'payout_notifications',
            defaultValue: true,
          ) ??
          true;
      _kycNotifications = _storage.getPreference<bool>(
            'kyc_notifications',
            defaultValue: true,
          ) ??
          true;
      _promotionalNotifications = _storage.getPreference<bool>(
            'promotional_notifications',
            defaultValue: false,
          ) ??
          false;
    });
  }

  Future<void> _saveSetting(String key, bool value) async {
    await _storage.savePreference(key, value);
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
        title: const Text('Notification Settings'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildGeneralSection(),
            const SizedBox(height: 16.0),
            _buildChannelSection(),
            const SizedBox(height: 16.0),
            _buildSoundSection(),
            const SizedBox(height: 16.0),
            _buildNotificationTypesSection(),
            const SizedBox(height: 24.0),
          ],
        ),
      ),
    );
  }

  Widget _buildGeneralSection() {
    return _buildSection(
      title: 'General',
      children: [
        _buildSwitchTile(
          icon: Icons.notifications_active,
          title: 'Enable Notifications',
          subtitle: 'Receive all notifications',
          value: _notificationsEnabled,
          onChanged: (value) {
            setState(() => _notificationsEnabled = value);
            _saveSetting('notifications_enabled', value);
            if (!value) {
              _showMessage('All notifications disabled');
            }
          },
        ),
      ],
    );
  }

  Widget _buildChannelSection() {
    return _buildSection(
      title: 'Notification Channels',
      children: [
        _buildSwitchTile(
          icon: Icons.phone_android,
          title: 'Push Notifications',
          subtitle: 'Receive notifications on this device',
          value: _pushNotifications,
          enabled: _notificationsEnabled,
          onChanged: (value) {
            setState(() => _pushNotifications = value);
            _saveSetting('push_notifications', value);
          },
        ),
        _buildSwitchTile(
          icon: Icons.email_outlined,
          title: 'Email Notifications',
          subtitle: 'Receive notifications via email',
          value: _emailNotifications,
          enabled: _notificationsEnabled,
          onChanged: (value) {
            setState(() => _emailNotifications = value);
            _saveSetting('email_notifications', value);
          },
        ),
      ],
    );
  }

  Widget _buildSoundSection() {
    return _buildSection(
      title: 'Sound & Vibration',
      children: [
        _buildSwitchTile(
          icon: Icons.volume_up,
          title: 'Sound',
          subtitle: 'Play sound for notifications',
          value: _soundEnabled,
          enabled: _notificationsEnabled && _pushNotifications,
          onChanged: (value) {
            setState(() => _soundEnabled = value);
            _saveSetting('sound_enabled', value);
          },
        ),
        _buildSwitchTile(
          icon: Icons.vibration,
          title: 'Vibration',
          subtitle: 'Vibrate for notifications',
          value: _vibrationEnabled,
          enabled: _notificationsEnabled && _pushNotifications,
          onChanged: (value) {
            setState(() => _vibrationEnabled = value);
            _saveSetting('vibration_enabled', value);
          },
        ),
      ],
    );
  }

  Widget _buildNotificationTypesSection() {
    return _buildSection(
      title: 'Notification Types',
      children: [
        _buildSwitchTile(
          icon: Icons.trending_up,
          title: 'Investment',
          subtitle: 'Investment updates and property news',
          value: _investmentNotifications,
          enabled: _notificationsEnabled,
          onChanged: (value) {
            setState(() => _investmentNotifications = value);
            _saveSetting('investment_notifications', value);
          },
        ),
        _buildSwitchTile(
          icon: Icons.monetization_on,
          title: 'Commission',
          subtitle: 'Commission earnings and updates',
          value: _commissionNotifications,
          enabled: _notificationsEnabled,
          onChanged: (value) {
            setState(() => _commissionNotifications = value);
            _saveSetting('commission_notifications', value);
          },
        ),
        _buildSwitchTile(
          icon: Icons.group,
          title: 'Team',
          subtitle: 'Team member activities and achievements',
          value: _teamNotifications,
          enabled: _notificationsEnabled,
          onChanged: (value) {
            setState(() => _teamNotifications = value);
            _saveSetting('team_notifications', value);
          },
        ),
        _buildSwitchTile(
          icon: Icons.account_balance_wallet,
          title: 'Payout',
          subtitle: 'Withdrawal and payout updates',
          value: _payoutNotifications,
          enabled: _notificationsEnabled,
          onChanged: (value) {
            setState(() => _payoutNotifications = value);
            _saveSetting('payout_notifications', value);
          },
        ),
        _buildSwitchTile(
          icon: Icons.verified_user,
          title: 'KYC',
          subtitle: 'KYC verification status updates',
          value: _kycNotifications,
          enabled: _notificationsEnabled,
          onChanged: (value) {
            setState(() => _kycNotifications = value);
            _saveSetting('kyc_notifications', value);
          },
        ),
        _buildSwitchTile(
          icon: Icons.campaign,
          title: 'Promotional',
          subtitle: 'Offers, promotions, and marketing',
          value: _promotionalNotifications,
          enabled: _notificationsEnabled,
          onChanged: (value) {
            setState(() => _promotionalNotifications = value);
            _saveSetting('promotional_notifications', value);
          },
        ),
      ],
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

  Widget _buildSwitchTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged, bool enabled = true,
  }) {
    return Opacity(
      opacity: enabled ? 1.0 : 0.5,
      child: ListTile(
        leading: Container(
          width: 40.0,
          height: 40.0,
          decoration: BoxDecoration(
            color: AppColors.primaryExtraLight,
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: Icon(
            icon,
            color: AppColors.primary,
            size: 22.0,
          ),
        ),
        title: Text(
          title,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
        ),
        subtitle: Text(
          subtitle,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.textSecondary,
              ),
        ),
        trailing: Switch(
          value: value,
          onChanged: enabled ? onChanged : null,
          activeThumbColor: AppColors.primary,
        ),
      ),
    );
  }
}
