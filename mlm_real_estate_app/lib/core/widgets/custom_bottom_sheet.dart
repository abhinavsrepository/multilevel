import 'package:flutter/material.dart';

/// Custom bottom sheet helpers and widgets
///
/// Supports:
/// - Modal bottom sheet
/// - Draggable indicator
/// - Custom height and sizing
/// - Full screen mode
/// - List bottom sheet
/// - Grid bottom sheet
/// - Custom content
class CustomBottomSheet {
  /// Shows a modal bottom sheet with custom styling
  static Future<T?> show<T>({
    required BuildContext context,
    required Widget child,
    double? height,
    bool isScrollControlled = false,
    bool isDismissible = true,
    bool enableDrag = true,
    Color? backgroundColor,
    double? elevation,
    ShapeBorder? shape,
    bool showDragHandle = true,
    bool useRootNavigator = false,
    bool useSafeArea = true,
  }) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: isScrollControlled,
      isDismissible: isDismissible,
      enableDrag: enableDrag,
      backgroundColor: backgroundColor ?? Colors.transparent,
      elevation: elevation ?? 0.0,
      shape: shape ??
          const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
          ),
      useRootNavigator: useRootNavigator,
      useSafeArea: useSafeArea,
      builder: (context) => BottomSheetContainer(
        height: height,
        showDragHandle: showDragHandle,
        child: child,
      ),
    );
  }

  /// Shows a full screen bottom sheet
  static Future<T?> showFullScreen<T>({
    required BuildContext context,
    required Widget child,
    bool isDismissible = true,
    bool enableDrag = true,
    Color? backgroundColor,
    bool showDragHandle = false,
  }) {
    return show<T>(
      context: context,
      child: child,
      isScrollControlled: true,
      isDismissible: isDismissible,
      enableDrag: enableDrag,
      backgroundColor: backgroundColor,
      showDragHandle: showDragHandle,
      height: MediaQuery.of(context).size.height * 0.95,
    );
  }

  /// Shows a list bottom sheet
  static Future<T?> showList<T>({
    required BuildContext context,
    required List<BottomSheetItem<T>> items, String? title,
    bool showDragHandle = true,
  }) {
    return show<T>(
      context: context,
      showDragHandle: showDragHandle,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (title != null) ...[
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 18.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const Divider(height: 1.0),
          ],
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return ListTile(
                leading: item.icon != null ? Icon(item.icon) : null,
                title: Text(item.title),
                subtitle: item.subtitle != null ? Text(item.subtitle!) : null,
                trailing: item.trailing,
                onTap: () => Navigator.pop(context, item.value),
              );
            },
          ),
        ],
      ),
    );
  }

  /// Shows a grid bottom sheet
  static Future<T?> showGrid<T>({
    required BuildContext context,
    required List<BottomSheetGridItem<T>> items, String? title,
    int crossAxisCount = 3,
    double childAspectRatio = 1.0,
    bool showDragHandle = true,
  }) {
    return show<T>(
      context: context,
      showDragHandle: showDragHandle,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (title != null) ...[
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 18.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: crossAxisCount,
                childAspectRatio: childAspectRatio,
                crossAxisSpacing: 12.0,
                mainAxisSpacing: 12.0,
              ),
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                return InkWell(
                  onTap: () => Navigator.pop(context, item.value),
                  borderRadius: BorderRadius.circular(8.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        item.icon,
                        size: 32.0,
                        color: item.iconColor,
                      ),
                      const SizedBox(height: 8.0),
                      Text(
                        item.title,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 12.0),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  /// Shows a confirmation bottom sheet
  static Future<bool?> showConfirmation({
    required BuildContext context,
    required String message, String? title,
    String confirmText = 'Confirm',
    String cancelText = 'Cancel',
    Color? confirmColor,
    bool isDanger = false,
  }) {
    return show<bool>(
      context: context,
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (title != null) ...[
              Text(
                title,
                style: const TextStyle(
                  fontSize: 20.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16.0),
            ],
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16.0),
            ),
            const SizedBox(height: 24.0),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context, false),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12.0),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                    ),
                    child: Text(cancelText),
                  ),
                ),
                const SizedBox(width: 12.0),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context, true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: confirmColor ??
                          (isDanger ? Colors.red : null),
                      padding: const EdgeInsets.symmetric(vertical: 12.0),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                    ),
                    child: Text(confirmText),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Bottom sheet container with optional drag handle
class BottomSheetContainer extends StatelessWidget {
  final Widget child;
  final double? height;
  final bool showDragHandle;
  final Color? backgroundColor;
  final EdgeInsetsGeometry? padding;

  const BottomSheetContainer({
    required this.child, super.key,
    this.height,
    this.showDragHandle = true,
    this.backgroundColor,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      height: height,
      decoration: BoxDecoration(
        color: backgroundColor ??
            theme.bottomSheetTheme.backgroundColor ??
            theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20.0)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showDragHandle) const DragHandle(),
          Flexible(
            child: Padding(
              padding: padding ?? EdgeInsets.zero,
              child: child,
            ),
          ),
        ],
      ),
    );
  }
}

/// Drag handle widget for bottom sheets
class DragHandle extends StatelessWidget {
  final Color? color;
  final double width;
  final double height;
  final EdgeInsetsGeometry? margin;

  const DragHandle({
    super.key,
    this.color,
    this.width = 40.0,
    this.height = 4.0,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin ?? const EdgeInsets.symmetric(vertical: 12.0),
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: color ?? Colors.grey[300],
        borderRadius: BorderRadius.circular(height / 2),
      ),
    );
  }
}

/// Bottom sheet item for list bottom sheet
class BottomSheetItem<T> {
  final String title;
  final String? subtitle;
  final IconData? icon;
  final Widget? trailing;
  final T value;

  const BottomSheetItem({
    required this.title,
    required this.value, this.subtitle,
    this.icon,
    this.trailing,
  });
}

/// Bottom sheet grid item for grid bottom sheet
class BottomSheetGridItem<T> {
  final String title;
  final IconData icon;
  final Color? iconColor;
  final T value;

  const BottomSheetGridItem({
    required this.title,
    required this.icon,
    required this.value, this.iconColor,
  });
}

/// Scrollable bottom sheet with custom max height
class ScrollableBottomSheet extends StatelessWidget {
  final Widget child;
  final double initialChildSize;
  final double minChildSize;
  final double maxChildSize;
  final bool showDragHandle;
  final Color? backgroundColor;

  const ScrollableBottomSheet({
    required this.child, super.key,
    this.initialChildSize = 0.5,
    this.minChildSize = 0.25,
    this.maxChildSize = 0.95,
    this.showDragHandle = true,
    this.backgroundColor,
  });

  static Future<T?> show<T>({
    required BuildContext context,
    required Widget child,
    double initialChildSize = 0.5,
    double minChildSize = 0.25,
    double maxChildSize = 0.95,
    bool showDragHandle = true,
    Color? backgroundColor,
  }) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ScrollableBottomSheet(
        initialChildSize: initialChildSize,
        minChildSize: minChildSize,
        maxChildSize: maxChildSize,
        showDragHandle: showDragHandle,
        backgroundColor: backgroundColor,
        child: child,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DraggableScrollableSheet(
      initialChildSize: initialChildSize,
      minChildSize: minChildSize,
      maxChildSize: maxChildSize,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: backgroundColor ??
                theme.bottomSheetTheme.backgroundColor ??
                theme.scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(20.0),
            ),
          ),
          child: Column(
            children: [
              if (showDragHandle) const DragHandle(),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  child: child,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
