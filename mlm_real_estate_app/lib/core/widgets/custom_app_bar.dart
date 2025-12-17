import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Custom app bar widget with enhanced features
///
/// Supports:
/// - Title and subtitle
/// - Leading widget/action
/// - Multiple actions
/// - Background color/gradient
/// - Elevation control
/// - Center title option
/// - Search mode
/// - Custom height
class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final String? subtitle;
  final Widget? titleWidget;
  final Widget? leading;
  final List<Widget>? actions;
  final Color? backgroundColor;
  final Gradient? backgroundGradient;
  final double elevation;
  final bool centerTitle;
  final double? toolbarHeight;
  final TextStyle? titleStyle;
  final TextStyle? subtitleStyle;
  final bool automaticallyImplyLeading;
  final SystemUiOverlayStyle? systemOverlayStyle;
  final IconThemeData? iconTheme;
  final IconThemeData? actionsIconTheme;
  final ShapeBorder? shape;
  final Color? shadowColor;
  final double? leadingWidth;
  final bool? forceMaterialTransparency;

  const CustomAppBar({
    super.key,
    this.title,
    this.subtitle,
    this.titleWidget,
    this.leading,
    this.actions,
    this.backgroundColor,
    this.backgroundGradient,
    this.elevation = 0.0,
    this.centerTitle = true,
    this.toolbarHeight,
    this.titleStyle,
    this.subtitleStyle,
    this.automaticallyImplyLeading = true,
    this.systemOverlayStyle,
    this.iconTheme,
    this.actionsIconTheme,
    this.shape,
    this.shadowColor,
    this.leadingWidth,
    this.forceMaterialTransparency,
  });

  @override
  Size get preferredSize => Size.fromHeight(toolbarHeight ?? kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Widget? titleContent;
    if (titleWidget != null) {
      titleContent = titleWidget;
    } else if (title != null) {
      if (subtitle != null) {
        titleContent = Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: centerTitle
              ? CrossAxisAlignment.center
              : CrossAxisAlignment.start,
          children: [
            Text(
              title!,
              style: titleStyle ??
                  theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: _getTitleColor(theme),
                  ),
            ),
            const SizedBox(height: 2.0),
            Text(
              subtitle!,
              style: subtitleStyle ??
                  theme.textTheme.bodySmall?.copyWith(
                    color: _getTitleColor(theme).withValues(alpha: 0.7),
                  ),
            ),
          ],
        );
      } else {
        titleContent = Text(
          title!,
          style: titleStyle ??
              theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: _getTitleColor(theme),
              ),
        );
      }
    }

    final appBar = AppBar(
      title: titleContent,
      leading: leading,
      actions: actions,
      backgroundColor: backgroundGradient == null
          ? (backgroundColor ?? theme.appBarTheme.backgroundColor)
          : Colors.transparent,
      elevation: elevation,
      centerTitle: centerTitle,
      toolbarHeight: toolbarHeight,
      automaticallyImplyLeading: automaticallyImplyLeading,
      systemOverlayStyle: systemOverlayStyle,
      iconTheme: iconTheme,
      actionsIconTheme: actionsIconTheme,
      shape: shape,
      shadowColor: shadowColor,
      leadingWidth: leadingWidth,
      forceMaterialTransparency: forceMaterialTransparency ?? false,
    );

    if (backgroundGradient != null) {
      return Container(
        decoration: BoxDecoration(
          gradient: backgroundGradient,
        ),
        child: appBar,
      );
    }

    return appBar;
  }

  Color _getTitleColor(ThemeData theme) {
    if (backgroundColor != null) {
      return _getContrastColor(backgroundColor!);
    }
    if (backgroundGradient != null) {
      return Colors.white;
    }
    return theme.appBarTheme.foregroundColor ?? Colors.black;
  }

  Color _getContrastColor(Color backgroundColor) {
    final luminance = backgroundColor.computeLuminance();
    return luminance > 0.5 ? Colors.black : Colors.white;
  }
}

/// Search app bar with integrated search field
class SearchAppBar extends StatefulWidget implements PreferredSizeWidget {
  final String? hintText;
  final TextEditingController? controller;
  final void Function(String)? onChanged;
  final void Function(String)? onSubmitted;
  final VoidCallback? onClear;
  final VoidCallback? onBack;
  final List<Widget>? actions;
  final Color? backgroundColor;
  final double elevation;
  final bool autofocus;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final double? toolbarHeight;

  const SearchAppBar({
    super.key,
    this.hintText,
    this.controller,
    this.onChanged,
    this.onSubmitted,
    this.onClear,
    this.onBack,
    this.actions,
    this.backgroundColor,
    this.elevation = 0.0,
    this.autofocus = true,
    this.keyboardType,
    this.textInputAction,
    this.toolbarHeight,
  });

  @override
  Size get preferredSize => Size.fromHeight(toolbarHeight ?? kToolbarHeight);

  @override
  State<SearchAppBar> createState() => _SearchAppBarState();
}

class _SearchAppBarState extends State<SearchAppBar> {
  late TextEditingController _controller;
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
    _hasText = _controller.text.isNotEmpty;
    _controller.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _controller.removeListener(_onTextChanged);
    if (widget.controller == null) {
      _controller.dispose();
    }
    super.dispose();
  }

  void _onTextChanged() {
    setState(() {
      _hasText = _controller.text.isNotEmpty;
    });
  }

  void _handleClear() {
    _controller.clear();
    widget.onClear?.call();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppBar(
      backgroundColor: widget.backgroundColor ?? theme.appBarTheme.backgroundColor,
      elevation: widget.elevation,
      toolbarHeight: widget.toolbarHeight,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back),
        onPressed: widget.onBack ?? () => Navigator.of(context).pop(),
      ),
      title: TextField(
        controller: _controller,
        autofocus: widget.autofocus,
        keyboardType: widget.keyboardType,
        textInputAction: widget.textInputAction ?? TextInputAction.search,
        onChanged: widget.onChanged,
        onSubmitted: widget.onSubmitted,
        style: theme.textTheme.bodyLarge,
        decoration: InputDecoration(
          hintText: widget.hintText ?? 'Search...',
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          suffixIcon: _hasText
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: _handleClear,
                )
              : null,
        ),
      ),
      actions: widget.actions,
    );
  }
}

/// Gradient app bar with custom gradient
class GradientAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final Widget? titleWidget;
  final Widget? leading;
  final List<Widget>? actions;
  final Gradient gradient;
  final double elevation;
  final bool centerTitle;
  final double? toolbarHeight;
  final TextStyle? titleStyle;
  final bool automaticallyImplyLeading;

  const GradientAppBar({
    required this.gradient,
    super.key,
    this.title,
    this.titleWidget,
    this.leading,
    this.actions,
    this.elevation = 0.0,
    this.centerTitle = true,
    this.toolbarHeight,
    this.titleStyle,
    this.automaticallyImplyLeading = true,
  });

  @override
  Size get preferredSize => Size.fromHeight(toolbarHeight ?? kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: gradient,
      ),
      child: AppBar(
        title: titleWidget ?? (title != null ? Text(title!) : null),
        leading: leading,
        actions: actions,
        backgroundColor: Colors.transparent,
        elevation: elevation,
        centerTitle: centerTitle,
        toolbarHeight: toolbarHeight,
        automaticallyImplyLeading: automaticallyImplyLeading,
        titleTextStyle: titleStyle ??
            const TextStyle(
              fontSize: 20.0,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
        iconTheme: const IconThemeData(color: Colors.white),
        actionsIconTheme: const IconThemeData(color: Colors.white),
      ),
    );
  }
}

/// Sliver app bar wrapper for custom scrolling effects
class CustomSliverAppBar extends StatelessWidget {
  final String? title;
  final Widget? flexibleSpace;
  final Widget? background;
  final List<Widget>? actions;
  final Widget? leading;
  final double expandedHeight;
  final double collapsedHeight;
  final bool pinned;
  final bool floating;
  final bool snap;
  final Color? backgroundColor;
  final double elevation;
  final bool centerTitle;
  final TextStyle? titleStyle;

  const CustomSliverAppBar({
    super.key,
    this.title,
    this.flexibleSpace,
    this.background,
    this.actions,
    this.leading,
    this.expandedHeight = 200.0,
    this.collapsedHeight = kToolbarHeight,
    this.pinned = true,
    this.floating = false,
    this.snap = false,
    this.backgroundColor,
    this.elevation = 0.0,
    this.centerTitle = true,
    this.titleStyle,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SliverAppBar(
      expandedHeight: expandedHeight,
      collapsedHeight: collapsedHeight,
      pinned: pinned,
      floating: floating,
      snap: snap,
      backgroundColor: backgroundColor ?? theme.appBarTheme.backgroundColor,
      elevation: elevation,
      centerTitle: centerTitle,
      leading: leading,
      title: title != null ? Text(title!) : null,
      titleTextStyle: titleStyle ??
          theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
      actions: actions,
      flexibleSpace: flexibleSpace ??
          (background != null
              ? FlexibleSpaceBar(
                  background: background,
                )
              : null),
    );
  }
}

/// Tab app bar with integrated tab bar
class TabAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final List<Widget> tabs;
  final TabController? controller;
  final Widget? leading;
  final List<Widget>? actions;
  final Color? backgroundColor;
  final Color? indicatorColor;
  final double elevation;
  final bool centerTitle;
  final TextStyle? titleStyle;
  final bool isScrollable;
  final EdgeInsetsGeometry? labelPadding;
  final TabBarIndicatorSize? indicatorSize;
  final double? indicatorWeight;

  const TabAppBar({
    required this.tabs,
    super.key,
    this.title,
    this.controller,
    this.leading,
    this.actions,
    this.backgroundColor,
    this.indicatorColor,
    this.elevation = 0.0,
    this.centerTitle = true,
    this.titleStyle,
    this.isScrollable = false,
    this.labelPadding,
    this.indicatorSize,
    this.indicatorWeight,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight + 48.0);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppBar(
      backgroundColor: backgroundColor ?? theme.appBarTheme.backgroundColor,
      elevation: elevation,
      centerTitle: centerTitle,
      leading: leading,
      title: title != null ? Text(title!) : null,
      titleTextStyle: titleStyle,
      actions: actions,
      bottom: TabBar(
        controller: controller,
        tabs: tabs,
        isScrollable: isScrollable,
        indicatorColor: indicatorColor ?? theme.primaryColor,
        labelPadding: labelPadding,
        indicatorSize: indicatorSize,
        indicatorWeight: indicatorWeight ?? 2.0,
      ),
    );
  }
}
