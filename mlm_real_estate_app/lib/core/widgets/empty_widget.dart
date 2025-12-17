import 'package:flutter/material.dart';

/// Empty state widget for displaying when no data is available
///
/// Supports:
/// - Custom icon or image
/// - Title and description
/// - Action button
/// - Custom illustration
/// - Themeable styling
class EmptyWidget extends StatelessWidget {
  final IconData? icon;
  final String? imagePath;
  final Widget? illustration;
  final String title;
  final String? description;
  final String? actionButtonText;
  final VoidCallback? onActionPressed;
  final Color? iconColor;
  final double iconSize;
  final EdgeInsetsGeometry? padding;
  final TextStyle? titleStyle;
  final TextStyle? descriptionStyle;
  final double spacing;
  final bool showActionButton;

  const EmptyWidget({
    required this.title, super.key,
    this.icon,
    this.imagePath,
    this.illustration,
    this.description,
    this.actionButtonText,
    this.onActionPressed,
    this.iconColor,
    this.iconSize = 100.0,
    this.padding,
    this.titleStyle,
    this.descriptionStyle,
    this.spacing = 16.0,
    this.showActionButton = true,
  });

  /// Factory constructor for empty list
  factory EmptyWidget.list({
    String? title,
    String? description,
    String? actionButtonText,
    VoidCallback? onActionPressed,
  }) {
    return EmptyWidget(
      icon: Icons.inbox_outlined,
      title: title ?? 'No Items',
      description: description ?? 'There are no items to display.',
      actionButtonText: actionButtonText,
      onActionPressed: onActionPressed,
    );
  }

  /// Factory constructor for empty search results
  factory EmptyWidget.search({
    String? searchQuery,
    VoidCallback? onClearSearch,
  }) {
    return EmptyWidget(
      icon: Icons.search_off_rounded,
      title: 'No Results Found',
      description: searchQuery != null
          ? 'No results found for "$searchQuery".\nTry different keywords.'
          : 'No results found. Try different keywords.',
      actionButtonText: 'Clear Search',
      onActionPressed: onClearSearch,
    );
  }

  /// Factory constructor for no data
  factory EmptyWidget.noData({
    String? title,
    String? description,
    IconData? icon,
  }) {
    return EmptyWidget(
      icon: icon ?? Icons.data_usage_outlined,
      title: title ?? 'No Data Available',
      description: description ?? 'There is no data to display at the moment.',
      showActionButton: false,
    );
  }

  /// Factory constructor for no connection
  factory EmptyWidget.noConnection({
    VoidCallback? onRetry,
  }) {
    return EmptyWidget(
      icon: Icons.cloud_off_outlined,
      iconColor: Colors.orange,
      title: 'No Connection',
      description: 'Please check your internet connection and try again.',
      actionButtonText: 'Retry',
      onActionPressed: onRetry,
    );
  }

  /// Factory constructor for no notifications
  factory EmptyWidget.notifications() {
    return const EmptyWidget(
      icon: Icons.notifications_none_outlined,
      title: 'No Notifications',
      description: 'You don\'t have any notifications yet.',
      showActionButton: false,
    );
  }

  /// Factory constructor for no favorites
  factory EmptyWidget.favorites({
    VoidCallback? onBrowse,
  }) {
    return EmptyWidget(
      icon: Icons.favorite_border_outlined,
      title: 'No Favorites',
      description: 'You haven\'t added any items to your favorites yet.',
      actionButtonText: 'Browse Items',
      onActionPressed: onBrowse,
    );
  }

  /// Factory constructor for no messages
  factory EmptyWidget.messages() {
    return const EmptyWidget(
      icon: Icons.message_outlined,
      title: 'No Messages',
      description: 'You don\'t have any messages yet.',
      showActionButton: false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: SingleChildScrollView(
        padding: padding ?? const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            _buildIllustration(theme),
            SizedBox(height: spacing),
            Text(
              title,
              style: titleStyle ??
                  theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
              textAlign: TextAlign.center,
            ),
            if (description != null) ...[
              SizedBox(height: spacing / 2),
              Text(
                description!,
                style: descriptionStyle ??
                    theme.textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                textAlign: TextAlign.center,
              ),
            ],
            if (showActionButton &&
                actionButtonText != null &&
                onActionPressed != null) ...[
              SizedBox(height: spacing * 1.5),
              ElevatedButton(
                onPressed: onActionPressed,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32.0,
                    vertical: 12.0,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
                child: Text(actionButtonText!),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildIllustration(ThemeData theme) {
    if (illustration != null) {
      return illustration!;
    }

    if (imagePath != null) {
      return Image.asset(
        imagePath!,
        width: iconSize,
        height: iconSize,
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) {
          return _buildDefaultIcon(theme);
        },
      );
    }

    return _buildDefaultIcon(theme);
  }

  Widget _buildDefaultIcon(ThemeData theme) {
    return Container(
      width: iconSize,
      height: iconSize,
      decoration: BoxDecoration(
        color: (iconColor ?? theme.primaryColor).withOpacity(0.1),
        shape: BoxShape.circle,
      ),
      child: Icon(
        icon ?? Icons.inbox_outlined,
        size: iconSize * 0.5,
        color: iconColor ?? theme.primaryColor,
      ),
    );
  }
}

/// Compact empty widget for smaller spaces
class CompactEmptyWidget extends StatelessWidget {
  final IconData icon;
  final String message;
  final Color? color;

  const CompactEmptyWidget({
    required this.icon, required this.message, super.key,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveColor = color ?? Colors.grey[400];

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 48.0,
              color: effectiveColor,
            ),
            const SizedBox(height: 8.0),
            Text(
              message,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: effectiveColor,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

/// Animated empty widget with fade-in animation
class AnimatedEmptyWidget extends StatefulWidget {
  final EmptyWidget child;
  final Duration duration;

  const AnimatedEmptyWidget({
    required this.child, super.key,
    this.duration = const Duration(milliseconds: 500),
  });

  @override
  State<AnimatedEmptyWidget> createState() => _AnimatedEmptyWidgetState();
}

class _AnimatedEmptyWidgetState extends State<AnimatedEmptyWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeIn,
    ));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: widget.child,
      ),
    );
  }
}
