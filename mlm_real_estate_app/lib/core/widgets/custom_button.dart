import 'package:flutter/material.dart';

/// Custom button widget with various variants and states
///
/// Supports:
/// - Multiple button types (primary, secondary, outlined, text)
/// - Loading state with spinner
/// - Disabled state
/// - Icon support (left/right)
/// - Full width option
/// - Custom colors and styling
/// - Elevation control
/// - Border radius customization
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonType type;
  final bool isLoading;
  final bool isFullWidth;
  final IconData? leftIcon;
  final IconData? rightIcon;
  final Color? backgroundColor;
  final Color? textColor;
  final Color? borderColor;
  final double? elevation;
  final double borderRadius;
  final EdgeInsetsGeometry? padding;
  final double? height;
  final double? width;
  final TextStyle? textStyle;
  final double iconSpacing;
  final double? iconSize;
  final Widget? loadingWidget;

  const CustomButton({
    required this.text, required this.onPressed, super.key,
    this.type = ButtonType.primary,
    this.isLoading = false,
    this.isFullWidth = false,
    this.leftIcon,
    this.rightIcon,
    this.backgroundColor,
    this.textColor,
    this.borderColor,
    this.elevation,
    this.borderRadius = 8.0,
    this.padding,
    this.height,
    this.width,
    this.textStyle,
    this.iconSpacing = 8.0,
    this.iconSize,
    this.loadingWidget,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bool isDisabled = onPressed == null || isLoading;

    return SizedBox(
      height: height ?? 48.0,
      width: isFullWidth ? double.infinity : width,
      child: _buildButton(context, theme, isDisabled),
    );
  }

  Widget _buildButton(BuildContext context, ThemeData theme, bool isDisabled) {
    switch (type) {
      case ButtonType.primary:
        return _buildElevatedButton(theme, isDisabled);
      case ButtonType.secondary:
        return _buildSecondaryButton(theme, isDisabled);
      case ButtonType.outlined:
        return _buildOutlinedButton(theme, isDisabled);
      case ButtonType.text:
        return _buildTextButton(theme, isDisabled);
    }
  }

  Widget _buildElevatedButton(ThemeData theme, bool isDisabled) {
    return ElevatedButton(
      onPressed: isDisabled ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: backgroundColor ?? theme.primaryColor,
        foregroundColor: textColor ?? Colors.white,
        elevation: elevation ?? (type == ButtonType.primary ? 2.0 : 0.0),
        disabledBackgroundColor: backgroundColor?.withOpacity(0.5) ??
            theme.primaryColor.withOpacity(0.5),
        disabledForegroundColor: textColor?.withOpacity(0.5) ??
            Colors.white.withOpacity(0.5),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        padding: padding ?? const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
      ),
      child: _buildButtonContent(theme),
    );
  }

  Widget _buildSecondaryButton(ThemeData theme, bool isDisabled) {
    final secondaryColor = backgroundColor ?? theme.colorScheme.secondary;

    return ElevatedButton(
      onPressed: isDisabled ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: secondaryColor,
        foregroundColor: textColor ?? Colors.white,
        elevation: elevation ?? 2.0,
        disabledBackgroundColor: secondaryColor.withOpacity(0.5),
        disabledForegroundColor: Colors.white.withOpacity(0.5),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        padding: padding ?? const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
      ),
      child: _buildButtonContent(theme),
    );
  }

  Widget _buildOutlinedButton(ThemeData theme, bool isDisabled) {
    final outlineColor = borderColor ?? backgroundColor ?? theme.primaryColor;
    final outlineTextColor = textColor ?? theme.primaryColor;

    return OutlinedButton(
      onPressed: isDisabled ? null : onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: outlineTextColor,
        side: BorderSide(
          color: isDisabled ? outlineColor.withOpacity(0.5) : outlineColor,
          width: 1.5,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        padding: padding ?? const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
      ),
      child: _buildButtonContent(theme),
    );
  }

  Widget _buildTextButton(ThemeData theme, bool isDisabled) {
    return TextButton(
      onPressed: isDisabled ? null : onPressed,
      style: TextButton.styleFrom(
        foregroundColor: textColor ?? theme.primaryColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        padding: padding ?? const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
      ),
      child: _buildButtonContent(theme),
    );
  }

  Widget _buildButtonContent(ThemeData theme) {
    if (isLoading) {
      return loadingWidget ??
          SizedBox(
            height: 20.0,
            width: 20.0,
            child: CircularProgressIndicator(
              strokeWidth: 2.0,
              valueColor: AlwaysStoppedAnimation<Color>(
                textColor ?? (type == ButtonType.outlined || type == ButtonType.text
                    ? theme.primaryColor
                    : Colors.white),
              ),
            ),
          );
    }

    final List<Widget> children = [];

    if (leftIcon != null) {
      children.add(Icon(
        leftIcon,
        size: iconSize ?? 20.0,
      ));
      children.add(SizedBox(width: iconSpacing));
    }

    children.add(
      Text(
        text,
        style: textStyle ?? const TextStyle(
          fontSize: 16.0,
          fontWeight: FontWeight.w600,
        ),
      ),
    );

    if (rightIcon != null) {
      children.add(SizedBox(width: iconSpacing));
      children.add(Icon(
        rightIcon,
        size: iconSize ?? 20.0,
      ));
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: children,
    );
  }
}

/// Button type variants
enum ButtonType {
  /// Elevated button with background color and elevation
  primary,

  /// Secondary elevated button with secondary color
  secondary,

  /// Outlined button with border
  outlined,

  /// Text button without background or border
  text,
}
