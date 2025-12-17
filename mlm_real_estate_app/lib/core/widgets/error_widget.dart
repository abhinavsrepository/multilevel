import 'package:flutter/material.dart';

/// Custom error widget for displaying various error states
///
/// Supports:
/// - Different error types (network, server, not found, etc.)
/// - Custom error icons and messages
/// - Retry button with callback
/// - Custom actions
/// - Themeable styling
class CustomErrorWidget extends StatelessWidget {
  final ErrorType errorType;
  final String? title;
  final String? message;
  final IconData? icon;
  final VoidCallback? onRetry;
  final String? retryButtonText;
  final List<CustomErrorAction>? actions;
  final Color? iconColor;
  final double iconSize;
  final EdgeInsetsGeometry? padding;
  final TextStyle? titleStyle;
  final TextStyle? messageStyle;
  final bool showIcon;

  const CustomErrorWidget({
    super.key,
    this.errorType = ErrorType.general,
    this.title,
    this.message,
    this.icon,
    this.onRetry,
    this.retryButtonText,
    this.actions,
    this.iconColor,
    this.iconSize = 80.0,
    this.padding,
    this.titleStyle,
    this.messageStyle,
    this.showIcon = true,
  });

  /// Factory constructor for network error
  factory CustomErrorWidget.network({
    String? message,
    VoidCallback? onRetry,
    String? retryButtonText,
  }) {
    return CustomErrorWidget(
      errorType: ErrorType.network,
      message: message,
      onRetry: onRetry,
      retryButtonText: retryButtonText,
    );
  }

  /// Factory constructor for server error
  factory CustomErrorWidget.server({
    String? message,
    VoidCallback? onRetry,
    String? retryButtonText,
  }) {
    return CustomErrorWidget(
      errorType: ErrorType.server,
      message: message,
      onRetry: onRetry,
      retryButtonText: retryButtonText,
    );
  }

  /// Factory constructor for not found error
  factory CustomErrorWidget.notFound({
    String? message,
    VoidCallback? onRetry,
    String? retryButtonText,
  }) {
    return CustomErrorWidget(
      errorType: ErrorType.notFound,
      message: message,
      onRetry: onRetry,
      retryButtonText: retryButtonText,
    );
  }

  /// Factory constructor for unauthorized error
  factory CustomErrorWidget.unauthorized({
    String? message,
    List<CustomErrorAction>? actions,
  }) {
    return CustomErrorWidget(
      errorType: ErrorType.unauthorized,
      message: message,
      actions: actions,
    );
  }

  /// Factory constructor for timeout error
  factory CustomErrorWidget.timeout({
    String? message,
    VoidCallback? onRetry,
    String? retryButtonText,
  }) {
    return CustomErrorWidget(
      errorType: ErrorType.timeout,
      message: message,
      onRetry: onRetry,
      retryButtonText: retryButtonText,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final errorConfig = _getErrorConfig(theme);

    return Center(
      child: SingleChildScrollView(
        padding: padding ?? const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            if (showIcon) ...[
              Icon(
                icon ?? errorConfig.icon,
                size: iconSize,
                color: iconColor ?? errorConfig.color,
              ),
              const SizedBox(height: 24.0),
            ],
            Text(
              title ?? errorConfig.title,
              style: titleStyle ??
                  theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.textTheme.titleLarge?.color,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12.0),
            Text(
              message ?? errorConfig.message,
              style: messageStyle ??
                  theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24.0),
            if (onRetry != null) ...[
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: Text(retryButtonText ?? 'Retry'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32.0,
                    vertical: 12.0,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
              ),
              const SizedBox(height: 12.0),
            ],
            if (actions != null && actions!.isNotEmpty) ...[
              ...actions!.map(
                (action) => Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: action.isOutlined
                      ? OutlinedButton.icon(
                          onPressed: action.onPressed,
                          icon: action.icon != null
                              ? Icon(action.icon)
                              : const SizedBox.shrink(),
                          label: Text(action.label),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 32.0,
                              vertical: 12.0,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                          ),
                        )
                      : ElevatedButton.icon(
                          onPressed: action.onPressed,
                          icon: action.icon != null
                              ? Icon(action.icon)
                              : const SizedBox.shrink(),
                          label: Text(action.label),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 32.0,
                              vertical: 12.0,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                          ),
                        ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  _ErrorConfig _getErrorConfig(ThemeData theme) {
    switch (errorType) {
      case ErrorType.network:
        return const _ErrorConfig(
          icon: Icons.wifi_off_rounded,
          color: Colors.orange,
          title: 'No Internet Connection',
          message: 'Please check your internet connection and try again.',
        );
      case ErrorType.server:
        return const _ErrorConfig(
          icon: Icons.cloud_off_rounded,
          color: Colors.red,
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
        );
      case ErrorType.notFound:
        return const _ErrorConfig(
          icon: Icons.search_off_rounded,
          color: Colors.grey,
          title: 'Not Found',
          message: 'The requested resource could not be found.',
        );
      case ErrorType.unauthorized:
        return const _ErrorConfig(
          icon: Icons.lock_outline_rounded,
          color: Colors.deepOrange,
          title: 'Unauthorized',
          message: 'You do not have permission to access this resource.',
        );
      case ErrorType.timeout:
        return const _ErrorConfig(
          icon: Icons.access_time_rounded,
          color: Colors.amber,
          title: 'Request Timeout',
          message: 'The request took too long to complete. Please try again.',
        );
      case ErrorType.general:
      default:
        return _ErrorConfig(
          icon: Icons.error_outline_rounded,
          color: theme.colorScheme.error,
          title: 'Error',
          message: 'An unexpected error occurred. Please try again.',
        );
    }
  }
}

/// Error type enumeration
enum ErrorType {
  network,
  server,
  notFound,
  unauthorized,
  timeout,
  general,
}

/// Custom action for error widget
class CustomErrorAction {
  final String label;
  final VoidCallback onPressed;
  final IconData? icon;
  final bool isOutlined;

  const CustomErrorAction({
    required this.label,
    required this.onPressed,
    this.icon,
    this.isOutlined = false,
  });
}

/// Internal error configuration
class _ErrorConfig {
  final IconData icon;
  final Color color;
  final String title;
  final String message;

  const _ErrorConfig({
    required this.icon,
    required this.color,
    required this.title,
    required this.message,
  });
}

/// Simple error view with minimal UI
class SimpleErrorView extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const SimpleErrorView({
    required this.message, super.key,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline,
              size: 48.0,
              color: Colors.red[300],
            ),
            const SizedBox(height: 16.0),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 16.0),
              TextButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
