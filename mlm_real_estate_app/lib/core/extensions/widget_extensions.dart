import 'package:flutter/material.dart';

/// Widget extension methods for easier widget composition
extension WidgetExtensions on Widget {
  /// Adds padding to the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withPadding(EdgeInsets.all(16))
  /// ```
  Widget withPadding(EdgeInsets padding) {
    return Padding(
      padding: padding,
      child: this,
    );
  }

  /// Adds symmetric padding to the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withSymmetricPadding(horizontal: 16, vertical: 8)
  /// ```
  Widget withSymmetricPadding({double horizontal = 0, double vertical = 0}) {
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: horizontal,
        vertical: vertical,
      ),
      child: this,
    );
  }

  /// Adds padding to all sides of the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withAllPadding(16)
  /// ```
  Widget withAllPadding(double padding) {
    return Padding(
      padding: EdgeInsets.all(padding),
      child: this,
    );
  }

  /// Adds padding to specific sides of the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withOnlyPadding(left: 16, right: 16)
  /// ```
  Widget withOnlyPadding({
    double left = 0,
    double top = 0,
    double right = 0,
    double bottom = 0,
  }) {
    return Padding(
      padding: EdgeInsets.only(
        left: left,
        top: top,
        right: right,
        bottom: bottom,
      ),
      child: this,
    );
  }

  /// Adds margin to the widget using Container
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withMargin(EdgeInsets.all(16))
  /// ```
  Widget withMargin(EdgeInsets margin) {
    return Container(
      margin: margin,
      child: this,
    );
  }

  /// Adds symmetric margin to the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withSymmetricMargin(horizontal: 16, vertical: 8)
  /// ```
  Widget withSymmetricMargin({double horizontal = 0, double vertical = 0}) {
    return Container(
      margin: EdgeInsets.symmetric(
        horizontal: horizontal,
        vertical: vertical,
      ),
      child: this,
    );
  }

  /// Adds margin to all sides of the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withAllMargin(16)
  /// ```
  Widget withAllMargin(double margin) {
    return Container(
      margin: EdgeInsets.all(margin),
      child: this,
    );
  }

  /// Adds an onTap gesture to the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').onTap(() => print('Tapped'))
  /// ```
  Widget onTap(VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: this,
    );
  }

  /// Adds an onLongPress gesture to the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').onLongPress(() => print('Long pressed'))
  /// ```
  Widget onLongPress(VoidCallback onLongPress) {
    return GestureDetector(
      onLongPress: onLongPress,
      child: this,
    );
  }

  /// Adds an onDoubleTap gesture to the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').onDoubleTap(() => print('Double tapped'))
  /// ```
  Widget onDoubleTap(VoidCallback onDoubleTap) {
    return GestureDetector(
      onDoubleTap: onDoubleTap,
      child: this,
    );
  }

  /// Makes the widget tappable with InkWell
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').inkWell(onTap: () => print('Tapped'))
  /// ```
  Widget inkWell({
    VoidCallback? onTap,
    VoidCallback? onLongPress,
    VoidCallback? onDoubleTap,
    BorderRadius? borderRadius,
  }) {
    return InkWell(
      onTap: onTap,
      onLongPress: onLongPress,
      onDoubleTap: onDoubleTap,
      borderRadius: borderRadius,
      child: this,
    );
  }

  /// Adds visibility control to the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').visible(isVisible)
  /// ```
  Widget visible(bool isVisible, {Widget? replacement}) {
    return Visibility(
      visible: isVisible,
      replacement: replacement ?? const SizedBox.shrink(),
      child: this,
    );
  }

  /// Hides the widget if the condition is true
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').hidden(shouldHide)
  /// ```
  Widget hidden(bool isHidden, {Widget? replacement}) {
    return Visibility(
      visible: !isHidden,
      replacement: replacement ?? const SizedBox.shrink(),
      child: this,
    );
  }

  /// Centers the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').centered()
  /// ```
  Widget centered() {
    return Center(child: this);
  }

  /// Aligns the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').align(Alignment.topLeft)
  /// ```
  Widget align(Alignment alignment) {
    return Align(
      alignment: alignment,
      child: this,
    );
  }

  /// Expands the widget to fill available space
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').expanded()
  /// ```
  Widget expanded({int flex = 1}) {
    return Expanded(
      flex: flex,
      child: this,
    );
  }

  /// Makes the widget flexible
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').flexible()
  /// ```
  Widget flexible({int flex = 1, FlexFit fit = FlexFit.loose}) {
    return Flexible(
      flex: flex,
      fit: fit,
      child: this,
    );
  }

  /// Wraps the widget in a SizedBox with width and height
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withSize(width: 100, height: 50)
  /// ```
  Widget withSize({double? width, double? height}) {
    return SizedBox(
      width: width,
      height: height,
      child: this,
    );
  }

  /// Sets the width of the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withWidth(100)
  /// ```
  Widget withWidth(double width) {
    return SizedBox(
      width: width,
      child: this,
    );
  }

  /// Sets the height of the widget
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withHeight(50)
  /// ```
  Widget withHeight(double height) {
    return SizedBox(
      height: height,
      child: this,
    );
  }

  /// Wraps the widget in a Card
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').asCard()
  /// ```
  Widget asCard({
    Color? color,
    double? elevation,
    ShapeBorder? shape,
    EdgeInsets? margin,
  }) {
    return Card(
      color: color,
      elevation: elevation,
      shape: shape,
      margin: margin,
      child: this,
    );
  }

  /// Wraps the widget in a Container
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withContainer(
  ///   color: Colors.blue,
  ///   padding: EdgeInsets.all(16),
  /// )
  /// ```
  Widget withContainer({
    Color? color,
    EdgeInsets? padding,
    EdgeInsets? margin,
    Decoration? decoration,
    double? width,
    double? height,
    AlignmentGeometry? alignment,
  }) {
    return Container(
      color: decoration == null ? color : null,
      padding: padding,
      margin: margin,
      decoration: decoration,
      width: width,
      height: height,
      alignment: alignment,
      child: this,
    );
  }

  /// Wraps the widget with a background color
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withBackground(Colors.blue)
  /// ```
  Widget withBackground(Color color) {
    return Container(
      color: color,
      child: this,
    );
  }

  /// Wraps the widget with rounded corners
  ///
  /// Example:
  /// ```dart
  /// Container().withRoundedCorners(radius: 16)
  /// ```
  Widget withRoundedCorners({
    double radius = 8,
    Color? color,
    Border? border,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(radius),
        border: border,
      ),
      child: this,
    );
  }

  /// Wraps the widget with a border
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withBorder(
  ///   color: Colors.black,
  ///   width: 2,
  /// )
  /// ```
  Widget withBorder({
    Color color = Colors.black,
    double width = 1,
    double radius = 0,
  }) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: color, width: width),
        borderRadius: radius > 0 ? BorderRadius.circular(radius) : null,
      ),
      child: this,
    );
  }

  /// Wraps the widget with a shadow
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withShadow()
  /// ```
  Widget withShadow({
    Color color = Colors.black26,
    double blurRadius = 10,
    Offset offset = const Offset(0, 4),
    double borderRadius = 0,
  }) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: borderRadius > 0 ? BorderRadius.circular(borderRadius) : null,
        boxShadow: [
          BoxShadow(
            color: color,
            blurRadius: blurRadius,
            offset: offset,
          ),
        ],
      ),
      child: this,
    );
  }

  /// Wraps the widget with opacity
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').withOpacity(0.5)
  /// ```
  Widget withOpacity(double opacity) {
    return Opacity(
      opacity: opacity,
      child: this,
    );
  }

  /// Rotates the widget
  ///
  /// Example:
  /// ```dart
  /// Icon(Icons.arrow_forward).rotated(angle: 45)
  /// ```
  Widget rotated({required double angle}) {
    return Transform.rotate(
      angle: angle * (3.14159 / 180), // Convert degrees to radians
      child: this,
    );
  }

  /// Scales the widget
  ///
  /// Example:
  /// ```dart
  /// Icon(Icons.star).scaled(scale: 2.0)
  /// ```
  Widget scaled({double scale = 1.0}) {
    return Transform.scale(
      scale: scale,
      child: this,
    );
  }

  /// Wraps the widget in a SafeArea
  ///
  /// Example:
  /// ```dart
  /// Column(...).safeArea()
  /// ```
  Widget safeArea({
    bool top = true,
    bool bottom = true,
    bool left = true,
    bool right = true,
  }) {
    return SafeArea(
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      child: this,
    );
  }

  /// Wraps the widget in a SingleChildScrollView
  ///
  /// Example:
  /// ```dart
  /// Column(...).scrollable()
  /// ```
  Widget scrollable({
    Axis scrollDirection = Axis.vertical,
    EdgeInsets? padding,
    ScrollPhysics? physics,
  }) {
    return SingleChildScrollView(
      scrollDirection: scrollDirection,
      padding: padding,
      physics: physics,
      child: this,
    );
  }

  /// Wraps the widget with a Hero animation
  ///
  /// Example:
  /// ```dart
  /// Image.network(url).hero(tag: 'image-1')
  /// ```
  Widget hero({required String tag}) {
    return Hero(
      tag: tag,
      child: this,
    );
  }

  /// Wraps the widget with an animated opacity
  ///
  /// Example:
  /// ```dart
  /// Text('Hello').animatedOpacity(
  ///   opacity: isVisible ? 1.0 : 0.0,
  ///   duration: Duration(milliseconds: 300),
  /// )
  /// ```
  Widget animatedOpacity({
    required double opacity,
    required Duration duration,
    Curve curve = Curves.easeInOut,
  }) {
    return AnimatedOpacity(
      opacity: opacity,
      duration: duration,
      curve: curve,
      child: this,
    );
  }

  /// Wraps the widget with shimmer effect
  ///
  /// Example:
  /// ```dart
  /// Container(height: 100).shimmer()
  /// ```
  Widget shimmer({
    Color baseColor = const Color(0xFFE0E0E0),
    Color highlightColor = const Color(0xFFF5F5F5),
    Duration duration = const Duration(milliseconds: 1500),
  }) {
    return _ShimmerWidget(
      baseColor: baseColor,
      highlightColor: highlightColor,
      duration: duration,
      child: this,
    );
  }

  /// Wraps the widget in a ClipRRect for rounded corners
  ///
  /// Example:
  /// ```dart
  /// Image.network(url).clipRRect(radius: 16)
  /// ```
  Widget clipRRect({double radius = 8}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: this,
    );
  }

  /// Wraps the widget in a ClipOval
  ///
  /// Example:
  /// ```dart
  /// Image.network(url).clipOval()
  /// ```
  Widget clipOval() {
    return ClipOval(child: this);
  }

  /// Wraps the widget with a FittedBox
  ///
  /// Example:
  /// ```dart
  /// Text('Very long text').fitted()
  /// ```
  Widget fitted({BoxFit fit = BoxFit.contain}) {
    return FittedBox(
      fit: fit,
      child: this,
    );
  }

  /// Wraps the widget with AspectRatio
  ///
  /// Example:
  /// ```dart
  /// Image.network(url).aspectRatio(16 / 9)
  /// ```
  Widget aspectRatio(double aspectRatio) {
    return AspectRatio(
      aspectRatio: aspectRatio,
      child: this,
    );
  }

  /// Wraps the widget with a tooltip
  ///
  /// Example:
  /// ```dart
  /// Icon(Icons.info).tooltip('Information')
  /// ```
  Widget tooltip(String message) {
    return Tooltip(
      message: message,
      child: this,
    );
  }

  /// Wraps the widget with IgnorePointer
  ///
  /// Example:
  /// ```dart
  /// button.ignorePointer(shouldIgnore)
  /// ```
  Widget ignorePointer({bool ignoring = true}) {
    return IgnorePointer(
      ignoring: ignoring,
      child: this,
    );
  }

  /// Wraps the widget with AbsorbPointer
  ///
  /// Example:
  /// ```dart
  /// button.absorbPointer(shouldAbsorb)
  /// ```
  Widget absorbPointer({bool absorbing = true}) {
    return AbsorbPointer(
      absorbing: absorbing,
      child: this,
    );
  }
}

/// Shimmer widget for loading effects
class _ShimmerWidget extends StatefulWidget {
  final Widget child;
  final Color baseColor;
  final Color highlightColor;
  final Duration duration;

  const _ShimmerWidget({
    required this.child,
    required this.baseColor,
    required this.highlightColor,
    required this.duration,
  });

  @override
  State<_ShimmerWidget> createState() => _ShimmerWidgetState();
}

class _ShimmerWidgetState extends State<_ShimmerWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return ShaderMask(
          blendMode: BlendMode.srcATop,
          shaderCallback: (bounds) {
            return LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                widget.baseColor,
                widget.highlightColor,
                widget.baseColor,
              ],
              stops: [
                _controller.value - 0.3,
                _controller.value,
                _controller.value + 0.3,
              ].map((stop) => stop.clamp(0.0, 1.0)).toList(),
            ).createShader(bounds);
          },
          child: child,
        );
      },
      child: widget.child,
    );
  }
}
