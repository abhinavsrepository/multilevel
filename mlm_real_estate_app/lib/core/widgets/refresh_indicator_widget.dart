import 'package:flutter/material.dart';

/// Custom refresh indicator widget with enhanced features
///
/// Supports:
/// - Pull to refresh functionality
/// - Custom colors and styling
/// - Custom displacement
/// - Background color
/// - Stroke width customization
/// - Custom notification predicate
class CustomRefreshIndicator extends StatelessWidget {
  final Widget child;
  final Future<void> Function() onRefresh;
  final Color? color;
  final Color? backgroundColor;
  final double displacement;
  final double strokeWidth;
  final double edgeOffset;
  final ScrollNotificationPredicate? notificationPredicate;
  final String? semanticsLabel;
  final String? semanticsValue;

  const CustomRefreshIndicator({
    required this.child,
    required this.onRefresh,
    super.key,
    this.color,
    this.backgroundColor,
    this.displacement = 40.0,
    this.strokeWidth = 2.0,
    this.edgeOffset = 0.0,
    this.notificationPredicate,
    this.semanticsLabel,
    this.semanticsValue,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return RefreshIndicator(
      onRefresh: onRefresh,
      color: color ?? theme.primaryColor,
      backgroundColor: backgroundColor ?? theme.scaffoldBackgroundColor,
      displacement: displacement,
      strokeWidth: strokeWidth,
      edgeOffset: edgeOffset,
      notificationPredicate:
          notificationPredicate ?? defaultScrollNotificationPredicate,
      semanticsLabel: semanticsLabel,
      semanticsValue: semanticsValue,
      child: child,
    );
  }
}

/// Custom refresh indicator with custom builder
class CustomRefreshIndicatorBuilder extends StatelessWidget {
  final Widget child;
  final Future<void> Function() onRefresh;
  final Color? color;
  final Color? backgroundColor;
  final double displacement;
  final double strokeWidth;
  final double edgeOffset;

  const CustomRefreshIndicatorBuilder({
    required this.child,
    required this.onRefresh,
    super.key,
    this.color,
    this.backgroundColor,
    this.displacement = 40.0,
    this.strokeWidth = 2.0,
    this.edgeOffset = 0.0,
  });

  @override
  Widget build(BuildContext context) {
    return CustomRefreshIndicator(
      onRefresh: onRefresh,
      color: color,
      backgroundColor: backgroundColor,
      displacement: displacement,
      strokeWidth: strokeWidth,
      edgeOffset: edgeOffset,
      child: child,
    );
  }
}

/// Sliver refresh indicator for use with CustomScrollView
class SliverRefreshIndicator extends StatelessWidget {
  final List<Widget> slivers;
  final Future<void> Function() onRefresh;
  final Color? color;
  final Color? backgroundColor;
  final double displacement;
  final double strokeWidth;
  final double edgeOffset;

  const SliverRefreshIndicator({
    required this.slivers,
    required this.onRefresh,
    super.key,
    this.color,
    this.backgroundColor,
    this.displacement = 40.0,
    this.strokeWidth = 2.0,
    this.edgeOffset = 0.0,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return RefreshIndicator(
      onRefresh: onRefresh,
      color: color ?? theme.primaryColor,
      backgroundColor: backgroundColor ?? theme.scaffoldBackgroundColor,
      displacement: displacement,
      strokeWidth: strokeWidth,
      edgeOffset: edgeOffset,
      child: CustomScrollView(
        slivers: slivers,
      ),
    );
  }
}

/// Enhanced refresh indicator with pull-to-refresh animation
class EnhancedRefreshIndicator extends StatefulWidget {
  final Widget child;
  final Future<void> Function() onRefresh;
  final Color? color;
  final Color? backgroundColor;
  final double displacement;
  final Widget? refreshingWidget;
  final String? refreshingMessage;

  const EnhancedRefreshIndicator({
    required this.child,
    required this.onRefresh,
    super.key,
    this.color,
    this.backgroundColor,
    this.displacement = 40.0,
    this.refreshingWidget,
    this.refreshingMessage,
  });

  @override
  State<EnhancedRefreshIndicator> createState() =>
      _EnhancedRefreshIndicatorState();
}

class _EnhancedRefreshIndicatorState extends State<EnhancedRefreshIndicator> {
  bool _isRefreshing = false;

  Future<void> _handleRefresh() async {
    setState(() {
      _isRefreshing = true;
    });

    try {
      await widget.onRefresh();
    } finally {
      if (mounted) {
        setState(() {
          _isRefreshing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Stack(
      children: [
        RefreshIndicator(
          onRefresh: _handleRefresh,
          color: widget.color ?? theme.primaryColor,
          backgroundColor:
              widget.backgroundColor ?? theme.scaffoldBackgroundColor,
          displacement: widget.displacement,
          child: widget.child,
        ),
        if (_isRefreshing && widget.refreshingWidget != null)
          Positioned.fill(
            child: Container(
              color: Colors.black.withValues(alpha: 0.3),
              child: Center(
                child: widget.refreshingWidget,
              ),
            ),
          ),
      ],
    );
  }
}

/// Refresh wrapper for lists with empty state support
class RefreshableList extends StatelessWidget {
  final Future<void> Function() onRefresh;
  final Widget Function(BuildContext, int) itemBuilder;
  final int itemCount;
  final Widget? emptyWidget;
  final Color? refreshColor;
  final Color? backgroundColor;
  final EdgeInsetsGeometry? padding;
  final ScrollPhysics? physics;
  final Widget? separator;
  final bool shrinkWrap;
  final ScrollController? controller;

  const RefreshableList({
    required this.onRefresh,
    required this.itemBuilder,
    required this.itemCount,
    super.key,
    this.emptyWidget,
    this.refreshColor,
    this.backgroundColor,
    this.padding,
    this.physics,
    this.separator,
    this.shrinkWrap = false,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    if (itemCount == 0 && emptyWidget != null) {
      return CustomRefreshIndicator(
        onRefresh: onRefresh,
        color: refreshColor,
        backgroundColor: backgroundColor,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: SizedBox(
            height: MediaQuery.of(context).size.height * 0.7,
            child: emptyWidget,
          ),
        ),
      );
    }

    return CustomRefreshIndicator(
      onRefresh: onRefresh,
      color: refreshColor,
      backgroundColor: backgroundColor,
      child: separator != null
          ? ListView.separated(
              controller: controller,
              itemCount: itemCount,
              padding: padding,
              physics: physics,
              shrinkWrap: shrinkWrap,
              itemBuilder: itemBuilder,
              separatorBuilder: (context, index) => separator!,
            )
          : ListView.builder(
              controller: controller,
              itemCount: itemCount,
              padding: padding,
              physics: physics,
              shrinkWrap: shrinkWrap,
              itemBuilder: itemBuilder,
            ),
    );
  }
}

/// Refresh wrapper for grid views
class RefreshableGrid extends StatelessWidget {
  final Future<void> Function() onRefresh;
  final Widget Function(BuildContext, int) itemBuilder;
  final int itemCount;
  final int crossAxisCount;
  final double mainAxisSpacing;
  final double crossAxisSpacing;
  final double childAspectRatio;
  final Widget? emptyWidget;
  final Color? refreshColor;
  final Color? backgroundColor;
  final EdgeInsetsGeometry? padding;
  final ScrollPhysics? physics;
  final bool shrinkWrap;
  final ScrollController? controller;

  const RefreshableGrid({
    required this.onRefresh,
    required this.itemBuilder,
    required this.itemCount,
    super.key,
    this.crossAxisCount = 2,
    this.mainAxisSpacing = 8.0,
    this.crossAxisSpacing = 8.0,
    this.childAspectRatio = 1.0,
    this.emptyWidget,
    this.refreshColor,
    this.backgroundColor,
    this.padding,
    this.physics,
    this.shrinkWrap = false,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    if (itemCount == 0 && emptyWidget != null) {
      return CustomRefreshIndicator(
        onRefresh: onRefresh,
        color: refreshColor,
        backgroundColor: backgroundColor,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: SizedBox(
            height: MediaQuery.of(context).size.height * 0.7,
            child: emptyWidget,
          ),
        ),
      );
    }

    return CustomRefreshIndicator(
      onRefresh: onRefresh,
      color: refreshColor,
      backgroundColor: backgroundColor,
      child: GridView.builder(
        controller: controller,
        itemCount: itemCount,
        padding: padding,
        physics: physics,
        shrinkWrap: shrinkWrap,
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          mainAxisSpacing: mainAxisSpacing,
          crossAxisSpacing: crossAxisSpacing,
          childAspectRatio: childAspectRatio,
        ),
        itemBuilder: itemBuilder,
      ),
    );
  }
}

/// Pull-to-refresh handler mixin
mixin RefreshableMixin<T extends StatefulWidget> on State<T> {
  bool _isRefreshing = false;

  bool get isRefreshing => _isRefreshing;

  Future<void> refresh() async {
    if (_isRefreshing) return;

    setState(() {
      _isRefreshing = true;
    });

    try {
      await onRefresh();
    } finally {
      if (mounted) {
        setState(() {
          _isRefreshing = false;
        });
      }
    }
  }

  Future<void> onRefresh();
}
