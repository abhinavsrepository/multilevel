import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:badges/badges.dart' as badges;
import '../../core/constants/color_constants.dart';
import '../../data/providers/notification_provider.dart';

/// Bottom navigation bar widget
///
/// Provides navigation between 5 main sections:
/// Dashboard, Properties, Investments, Team, and Profile
class BottomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const BottomNavBar({
    required this.currentIndex, required this.onTap, super.key,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final notificationProvider = context.watch<NotificationProvider>();
    final unreadCount = notificationProvider.unreadCount;

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 10.0,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Container(
          height: 70.0,
          padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                context: context,
                index: 0,
                icon: Icons.dashboard_outlined,
                activeIcon: Icons.dashboard,
                label: 'Dashboard',
                isActive: currentIndex == 0,
              ),
              _buildNavItem(
                context: context,
                index: 1,
                icon: Icons.business_outlined,
                activeIcon: Icons.business,
                label: 'Properties',
                isActive: currentIndex == 1,
              ),
              _buildNavItem(
                context: context,
                index: 2,
                icon: Icons.account_balance_wallet_outlined,
                activeIcon: Icons.account_balance_wallet,
                label: 'Investments',
                isActive: currentIndex == 2,
              ),
              _buildNavItem(
                context: context,
                index: 3,
                icon: Icons.people_outline,
                activeIcon: Icons.people,
                label: 'Team',
                isActive: currentIndex == 3,
                badgeCount: unreadCount > 0 ? unreadCount : null,
              ),
              _buildNavItem(
                context: context,
                index: 4,
                icon: Icons.person_outline,
                activeIcon: Icons.person,
                label: 'Profile',
                isActive: currentIndex == 4,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required BuildContext context,
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
    required bool isActive,
    int? badgeCount,
  }) {
    final theme = Theme.of(context);

    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => onTap(index),
          borderRadius: BorderRadius.circular(12.0),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                badgeCount != null && badgeCount > 0
                    ? badges.Badge(
                        badgeContent: Text(
                          badgeCount > 99 ? '99+' : badgeCount.toString(),
                          style: const TextStyle(
                            color: AppColors.white,
                            fontSize: 10.0,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        badgeStyle: const badges.BadgeStyle(
                          badgeColor: AppColors.error,
                          padding: EdgeInsets.all(4.0),
                        ),
                        position: badges.BadgePosition.topEnd(top: -8, end: -8),
                        child: Icon(
                          isActive ? activeIcon : icon,
                          color: isActive ? AppColors.primary : AppColors.textSecondary,
                          size: 24.0,
                        ),
                      )
                    : Icon(
                        isActive ? activeIcon : icon,
                        color: isActive ? AppColors.primary : AppColors.textSecondary,
                        size: 24.0,
                      ),
                const SizedBox(height: 4.0),
                Text(
                  label,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: isActive ? AppColors.primary : AppColors.textSecondary,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                    fontSize: 11.0,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Bottom navigation host widget that manages navigation between screens
class BottomNavHost extends StatefulWidget {
  const BottomNavHost({super.key});

  @override
  State<BottomNavHost> createState() => _BottomNavHostState();
}

class _BottomNavHostState extends State<BottomNavHost> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const _DashboardPlaceholder(),
    const _PropertiesPlaceholder(),
    const _InvestmentsPlaceholder(),
    const _TeamPlaceholder(),
    const _ProfilePlaceholder(),
  ];

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: _currentIndex,
        onTap: _onTabTapped,
      ),
    );
  }
}

class _DashboardPlaceholder extends StatelessWidget {
  const _DashboardPlaceholder();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Dashboard Screen'),
      ),
    );
  }
}

class _PropertiesPlaceholder extends StatelessWidget {
  const _PropertiesPlaceholder();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Properties Screen'),
      ),
    );
  }
}

class _InvestmentsPlaceholder extends StatelessWidget {
  const _InvestmentsPlaceholder();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Investments Screen'),
      ),
    );
  }
}

class _TeamPlaceholder extends StatelessWidget {
  const _TeamPlaceholder();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Team Screen'),
      ),
    );
  }
}

class _ProfilePlaceholder extends StatelessWidget {
  const _ProfilePlaceholder();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Profile Screen'),
      ),
    );
  }
}
