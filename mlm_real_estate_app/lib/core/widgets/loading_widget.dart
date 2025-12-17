import 'package:flutter/material.dart';

/// Loading widget with multiple display modes
///
/// Supports:
/// - Circular progress indicator
/// - Custom message display
/// - Overlay mode (covers entire screen)
/// - Full screen mode
/// - Shimmer effect
/// - Custom colors and styling
class LoadingWidget extends StatelessWidget {
  final String? message;
  final Color? color;
  final double size;
  final double strokeWidth;
  final bool showMessage;
  final TextStyle? messageStyle;
  final EdgeInsetsGeometry? padding;
  final Color? backgroundColor;

  const LoadingWidget({
    super.key,
    this.message,
    this.color,
    this.size = 40.0,
    this.strokeWidth = 4.0,
    this.showMessage = true,
    this.messageStyle,
    this.padding,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      color: backgroundColor,
      padding: padding ?? const EdgeInsets.all(16.0),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: size,
              height: size,
              child: CircularProgressIndicator(
                strokeWidth: strokeWidth,
                valueColor: AlwaysStoppedAnimation<Color>(
                  color ?? theme.primaryColor,
                ),
              ),
            ),
            if (showMessage && message != null) ...[
              const SizedBox(height: 16.0),
              Text(
                message!,
                style: messageStyle ?? theme.textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Creates a fullscreen loading overlay
  static Widget fullscreen({
    String? message,
    Color? color,
    Color backgroundColor = Colors.black54,
  }) {
    return Container(
      color: backgroundColor,
      child: LoadingWidget(
        message: message,
        color: color ?? Colors.white,
        messageStyle: const TextStyle(color: Colors.white),
      ),
    );
  }

  /// Shows loading as an overlay dialog
  static void showOverlay(
    BuildContext context, {
    String? message,
    bool barrierDismissible = false,
  }) {
    showDialog(
      context: context,
      barrierDismissible: barrierDismissible,
      barrierColor: Colors.black54,
      builder: (context) => WillPopScope(
        onWillPop: () async => barrierDismissible,
        child: LoadingWidget(
          message: message,
          color: Colors.white,
          messageStyle: const TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  /// Hides the loading overlay
  static void hideOverlay(BuildContext context) {
    Navigator.of(context, rootNavigator: true).pop();
  }
}

/// Shimmer loading widget with various predefined shapes
///
/// Supports:
/// - Rectangle, circle, and line shapes
/// - List shimmer
/// - Card shimmer
/// - Profile shimmer
/// - Custom dimensions and colors
class ShimmerLoadingWidget extends StatefulWidget {
  final double width;
  final double height;
  final ShimmerShape shape;
  final Color baseColor;
  final Color highlightColor;
  final Duration duration;
  final BorderRadius? borderRadius;

  const ShimmerLoadingWidget({
    required this.width, required this.height, super.key,
    this.shape = ShimmerShape.rectangle,
    this.baseColor = const Color(0xFFE0E0E0),
    this.highlightColor = const Color(0xFFF5F5F5),
    this.duration = const Duration(milliseconds: 1500),
    this.borderRadius,
  });

  @override
  State<ShimmerLoadingWidget> createState() => _ShimmerLoadingWidgetState();
}

class _ShimmerLoadingWidgetState extends State<ShimmerLoadingWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    )..repeat();

    _animation = Tween<double>(begin: -1.0, end: 2.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: _getDecoration(),
          child: ClipRRect(
            borderRadius: _getBorderRadius(),
            child: Stack(
              children: [
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          widget.baseColor,
                          widget.highlightColor,
                          widget.baseColor,
                        ],
                        stops: [
                          _animation.value - 0.3,
                          _animation.value,
                          _animation.value + 0.3,
                        ].map((e) => e.clamp(0.0, 1.0)).toList(),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  BoxDecoration _getDecoration() {
    switch (widget.shape) {
      case ShimmerShape.circle:
        return BoxDecoration(
          color: widget.baseColor,
          shape: BoxShape.circle,
        );
      case ShimmerShape.rectangle:
      case ShimmerShape.line:
        return BoxDecoration(
          color: widget.baseColor,
          borderRadius: _getBorderRadius(),
        );
    }
  }

  BorderRadius _getBorderRadius() {
    if (widget.shape == ShimmerShape.circle) {
      return BorderRadius.zero;
    }
    if (widget.borderRadius != null) {
      return widget.borderRadius!;
    }
    if (widget.shape == ShimmerShape.line) {
      return BorderRadius.circular(2.0);
    }
    return BorderRadius.circular(4.0);
  }
}

/// Shimmer shape variants
enum ShimmerShape {
  rectangle,
  circle,
  line,
}

/// Predefined shimmer loading layouts
class ShimmerLayouts {
  /// List item shimmer
  static Widget listItem({
    bool showAvatar = true,
    int lines = 2,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showAvatar) ...[
            const ShimmerLoadingWidget(
              width: 48.0,
              height: 48.0,
              shape: ShimmerShape.circle,
            ),
            const SizedBox(width: 12.0),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const ShimmerLoadingWidget(
                  width: double.infinity,
                  height: 16.0,
                  shape: ShimmerShape.line,
                ),
                const SizedBox(height: 8.0),
                for (int i = 0; i < lines - 1; i++) ...[
                  ShimmerLoadingWidget(
                    width: i == lines - 2 ? 150.0 : double.infinity,
                    height: 14.0,
                    shape: ShimmerShape.line,
                  ),
                  const SizedBox(height: 8.0),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Card shimmer
  static Widget card({
    double height = 200.0,
    bool showImage = true,
  }) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showImage) ...[
            ShimmerLoadingWidget(
              width: double.infinity,
              height: height,
              borderRadius: BorderRadius.circular(8.0),
            ),
            const SizedBox(height: 12.0),
          ],
          const ShimmerLoadingWidget(
            width: double.infinity,
            height: 20.0,
            shape: ShimmerShape.line,
          ),
          const SizedBox(height: 8.0),
          const ShimmerLoadingWidget(
            width: 200.0,
            height: 16.0,
            shape: ShimmerShape.line,
          ),
          const SizedBox(height: 8.0),
          const ShimmerLoadingWidget(
            width: 150.0,
            height: 16.0,
            shape: ShimmerShape.line,
          ),
        ],
      ),
    );
  }

  /// Profile header shimmer
  static Widget profileHeader() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          const ShimmerLoadingWidget(
            width: 100.0,
            height: 100.0,
            shape: ShimmerShape.circle,
          ),
          const SizedBox(height: 16.0),
          const ShimmerLoadingWidget(
            width: 150.0,
            height: 20.0,
            shape: ShimmerShape.line,
          ),
          const SizedBox(height: 8.0),
          const ShimmerLoadingWidget(
            width: 200.0,
            height: 16.0,
            shape: ShimmerShape.line,
          ),
          const SizedBox(height: 16.0),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: List.generate(
              3,
              (index) => const ShimmerLoadingWidget(
                width: 80.0,
                height: 40.0,
                borderRadius: BorderRadius.all(Radius.circular(8.0)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Grid item shimmer
  static Widget gridItem({
    double aspectRatio = 1.0,
  }) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: aspectRatio,
            child: const ShimmerLoadingWidget(
              width: double.infinity,
              height: double.infinity,
              borderRadius: BorderRadius.all(Radius.circular(8.0)),
            ),
          ),
          const SizedBox(height: 8.0),
          const ShimmerLoadingWidget(
            width: double.infinity,
            height: 16.0,
            shape: ShimmerShape.line,
          ),
          const SizedBox(height: 4.0),
          const ShimmerLoadingWidget(
            width: 100.0,
            height: 14.0,
            shape: ShimmerShape.line,
          ),
        ],
      ),
    );
  }
}
