import 'package:flutter/material.dart';

/// Shimmer widget for displaying loading skeleton screens
///
/// Supports:
/// - Customizable shimmer effect
/// - Predefined shapes (rectangle, circle, line)
/// - List shimmer layouts
/// - Card shimmer layouts
/// - Profile shimmer layouts
/// - Grid shimmer layouts
class ShimmerWidget extends StatefulWidget {
  final Widget child;
  final Color baseColor;
  final Color highlightColor;
  final Duration period;
  final ShimmerDirection direction;
  final bool enabled;

  const ShimmerWidget({
    required this.child, super.key,
    this.baseColor = const Color(0xFFE0E0E0),
    this.highlightColor = const Color(0xFFF5F5F5),
    this.period = const Duration(milliseconds: 1500),
    this.direction = ShimmerDirection.ltr,
    this.enabled = true,
  });

  @override
  State<ShimmerWidget> createState() => _ShimmerWidgetState();
}

class _ShimmerWidgetState extends State<ShimmerWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.period,
    );

    if (widget.enabled) {
      _controller.repeat();
    }
  }

  @override
  void didUpdateWidget(ShimmerWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.enabled) {
      _controller.repeat();
    } else {
      _controller.stop();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.enabled) {
      return widget.child;
    }

    return AnimatedBuilder(
      animation: _controller,
      child: widget.child,
      builder: (context, child) {
        return ShaderMask(
          blendMode: BlendMode.srcATop,
          shaderCallback: (bounds) {
            return LinearGradient(
              colors: [
                widget.baseColor,
                widget.highlightColor,
                widget.baseColor,
              ],
              stops: const [0.0, 0.5, 1.0],
              begin: _getBeginAlignment(),
              end: _getEndAlignment(),
              transform: _SlidingGradientTransform(
                slidePercent: _controller.value,
              ),
            ).createShader(bounds);
          },
          child: child,
        );
      },
    );
  }

  Alignment _getBeginAlignment() {
    switch (widget.direction) {
      case ShimmerDirection.ltr:
        return Alignment.centerLeft;
      case ShimmerDirection.rtl:
        return Alignment.centerRight;
      case ShimmerDirection.ttb:
        return Alignment.topCenter;
      case ShimmerDirection.btt:
        return Alignment.bottomCenter;
    }
  }

  Alignment _getEndAlignment() {
    switch (widget.direction) {
      case ShimmerDirection.ltr:
        return Alignment.centerRight;
      case ShimmerDirection.rtl:
        return Alignment.centerLeft;
      case ShimmerDirection.ttb:
        return Alignment.bottomCenter;
      case ShimmerDirection.btt:
        return Alignment.topCenter;
    }
  }
}

class _SlidingGradientTransform extends GradientTransform {
  final double slidePercent;

  const _SlidingGradientTransform({
    required this.slidePercent,
  });

  @override
  Matrix4? transform(Rect bounds, {TextDirection? textDirection}) {
    return Matrix4.translationValues(
      bounds.width * (slidePercent * 2 - 1),
      0.0,
      0.0,
    );
  }
}

/// Shimmer direction enumeration
enum ShimmerDirection {
  ltr,
  rtl,
  ttb,
  btt,
}

/// Shimmer box - basic building block for shimmer layouts
class ShimmerBox extends StatelessWidget {
  final double? width;
  final double? height;
  final BoxShape shape;
  final BorderRadius? borderRadius;
  final Color color;
  final EdgeInsetsGeometry? margin;

  const ShimmerBox({
    super.key,
    this.width,
    this.height,
    this.shape = BoxShape.rectangle,
    this.borderRadius,
    this.color = const Color(0xFFE0E0E0),
    this.margin,
  });

  /// Creates a circular shimmer box
  factory ShimmerBox.circle({
    required double size,
    Color color = const Color(0xFFE0E0E0),
    EdgeInsetsGeometry? margin,
  }) {
    return ShimmerBox(
      width: size,
      height: size,
      shape: BoxShape.circle,
      color: color,
      margin: margin,
    );
  }

  /// Creates a rounded rectangle shimmer box
  factory ShimmerBox.rounded({
    double? width,
    double? height,
    double borderRadius = 8.0,
    Color color = const Color(0xFFE0E0E0),
    EdgeInsetsGeometry? margin,
  }) {
    return ShimmerBox(
      width: width,
      height: height,
      borderRadius: BorderRadius.circular(borderRadius),
      color: color,
      margin: margin,
    );
  }

  /// Creates a line shimmer box
  factory ShimmerBox.line({
    double? width,
    double height = 12.0,
    Color color = const Color(0xFFE0E0E0),
    EdgeInsetsGeometry? margin,
  }) {
    return ShimmerBox(
      width: width,
      height: height,
      borderRadius: BorderRadius.circular(2.0),
      color: color,
      margin: margin,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      margin: margin,
      decoration: BoxDecoration(
        color: color,
        shape: shape,
        borderRadius: shape == BoxShape.circle ? null : borderRadius,
      ),
    );
  }
}

/// Predefined shimmer layouts for common use cases
class ShimmerLayouts {
  /// List item shimmer with avatar and text lines
  static Widget listItem({
    bool showAvatar = true,
    int textLines = 2,
    EdgeInsetsGeometry padding = const EdgeInsets.all(16.0),
  }) {
    return Padding(
      padding: padding,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showAvatar) ...[
            ShimmerBox.circle(size: 48.0),
            const SizedBox(width: 12.0),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ShimmerBox.line(width: double.infinity, height: 16.0),
                const SizedBox(height: 8.0),
                ...List.generate(
                  textLines - 1,
                  (index) => Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: ShimmerBox.line(
                      width: index == textLines - 2 ? 150.0 : double.infinity,
                      height: 14.0,
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

  /// Card shimmer with image and text
  static Widget card({
    double imageHeight = 200.0,
    bool showImage = true,
    int textLines = 3,
    EdgeInsetsGeometry padding = const EdgeInsets.all(16.0),
  }) {
    return Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showImage) ...[
            ShimmerBox.rounded(
              width: double.infinity,
              height: imageHeight,
              borderRadius: 8.0,
            ),
            const SizedBox(height: 12.0),
          ],
          ShimmerBox.line(width: double.infinity, height: 20.0),
          const SizedBox(height: 8.0),
          ...List.generate(
            textLines - 1,
            (index) => Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: ShimmerBox.line(
                width: index == textLines - 2 ? 200.0 : double.infinity,
                height: 16.0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Profile header shimmer
  static Widget profileHeader({
    EdgeInsetsGeometry padding = const EdgeInsets.all(16.0),
  }) {
    return Padding(
      padding: padding,
      child: Column(
        children: [
          ShimmerBox.circle(size: 100.0),
          const SizedBox(height: 16.0),
          ShimmerBox.line(width: 150.0, height: 20.0),
          const SizedBox(height: 8.0),
          ShimmerBox.line(width: 200.0, height: 16.0),
          const SizedBox(height: 16.0),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: List.generate(
              3,
              (index) => ShimmerBox.rounded(
                width: 80.0,
                height: 40.0,
                borderRadius: 8.0,
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
    EdgeInsetsGeometry padding = const EdgeInsets.all(8.0),
  }) {
    return Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: aspectRatio,
            child: ShimmerBox.rounded(
              width: double.infinity,
              height: double.infinity,
              borderRadius: 8.0,
            ),
          ),
          const SizedBox(height: 8.0),
          ShimmerBox.line(width: double.infinity, height: 16.0),
          const SizedBox(height: 4.0),
          ShimmerBox.line(width: 100.0, height: 14.0),
        ],
      ),
    );
  }

  /// Property card shimmer (specific to real estate)
  static Widget propertyCard({
    EdgeInsetsGeometry padding = const EdgeInsets.all(16.0),
  }) {
    return Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShimmerBox.rounded(
            width: double.infinity,
            height: 200.0,
            borderRadius: 12.0,
          ),
          const SizedBox(height: 12.0),
          ShimmerBox.line(width: double.infinity, height: 20.0),
          const SizedBox(height: 8.0),
          ShimmerBox.line(width: 150.0, height: 16.0),
          const SizedBox(height: 12.0),
          Row(
            children: [
              Expanded(
                child: ShimmerBox.rounded(
                  height: 36.0,
                  borderRadius: 6.0,
                ),
              ),
              const SizedBox(width: 8.0),
              Expanded(
                child: ShimmerBox.rounded(
                  height: 36.0,
                  borderRadius: 6.0,
                ),
              ),
              const SizedBox(width: 8.0),
              Expanded(
                child: ShimmerBox.rounded(
                  height: 36.0,
                  borderRadius: 6.0,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Team member card shimmer (specific to MLM)
  static Widget teamMemberCard({
    EdgeInsetsGeometry padding = const EdgeInsets.all(16.0),
  }) {
    return Padding(
      padding: padding,
      child: Row(
        children: [
          ShimmerBox.circle(size: 60.0),
          const SizedBox(width: 12.0),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ShimmerBox.line(width: double.infinity, height: 18.0),
                const SizedBox(height: 8.0),
                ShimmerBox.line(width: 120.0, height: 14.0),
                const SizedBox(height: 8.0),
                Row(
                  children: [
                    ShimmerBox.rounded(
                      width: 60.0,
                      height: 24.0,
                      borderRadius: 12.0,
                    ),
                    const SizedBox(width: 8.0),
                    ShimmerBox.rounded(
                      width: 60.0,
                      height: 24.0,
                      borderRadius: 12.0,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Dashboard stats shimmer
  static Widget dashboardStats({
    int itemCount = 4,
    EdgeInsetsGeometry padding = const EdgeInsets.all(16.0),
  }) {
    return Padding(
      padding: padding,
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12.0,
          mainAxisSpacing: 12.0,
          childAspectRatio: 1.5,
        ),
        itemCount: itemCount,
        itemBuilder: (context, index) {
          return ShimmerBox.rounded(
            borderRadius: 12.0,
          );
        },
      ),
    );
  }

  /// Comment shimmer
  static Widget comment({
    EdgeInsetsGeometry padding = const EdgeInsets.all(16.0),
  }) {
    return Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ShimmerBox.circle(size: 32.0),
              const SizedBox(width: 8.0),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ShimmerBox.line(width: 100.0, height: 14.0),
                  const SizedBox(height: 4.0),
                  ShimmerBox.line(width: 60.0, height: 12.0),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8.0),
          ShimmerBox.line(width: double.infinity, height: 14.0),
          const SizedBox(height: 4.0),
          ShimmerBox.line(width: 250.0, height: 14.0),
        ],
      ),
    );
  }
}

/// Shimmer list - wraps a list of items with shimmer effect
class ShimmerList extends StatelessWidget {
  final int itemCount;
  final Widget Function(BuildContext context, int index) itemBuilder;
  final Color baseColor;
  final Color highlightColor;
  final Duration period;
  final ScrollPhysics? physics;
  final bool shrinkWrap;
  final EdgeInsetsGeometry? padding;

  const ShimmerList({
    required this.itemCount, required this.itemBuilder, super.key,
    this.baseColor = const Color(0xFFE0E0E0),
    this.highlightColor = const Color(0xFFF5F5F5),
    this.period = const Duration(milliseconds: 1500),
    this.physics,
    this.shrinkWrap = false,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return ShimmerWidget(
      baseColor: baseColor,
      highlightColor: highlightColor,
      period: period,
      child: ListView.builder(
        itemCount: itemCount,
        physics: physics,
        shrinkWrap: shrinkWrap,
        padding: padding,
        itemBuilder: itemBuilder,
      ),
    );
  }
}
