import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Custom text field widget with comprehensive features
///
/// Supports:
/// - Label and hint text
/// - Prefix/suffix icons
/// - Password visibility toggle
/// - Validation support
/// - Error text display
/// - Max length counter
/// - Keyboard type customization
/// - Input formatters
/// - Read-only mode
/// - Multiline support
class CustomTextField extends StatefulWidget {
  final TextEditingController? controller;
  final String? labelText;
  final String? hintText;
  final String? helperText;
  final String? errorText;
  final IconData? prefixIcon;
  final Widget? prefix;
  final IconData? suffixIcon;
  final Widget? suffix;
  final bool isPassword;
  final bool readOnly;
  final bool enabled;
  final bool autofocus;
  final bool showCounter;
  final int? maxLines;
  final int? minLines;
  final int? maxLength;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final TextCapitalization textCapitalization;
  final List<TextInputFormatter>? inputFormatters;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final void Function(String)? onSubmitted;
  final void Function()? onTap;
  final void Function()? onEditingComplete;
  final FocusNode? focusNode;
  final String? initialValue;
  final EdgeInsetsGeometry? contentPadding;
  final Color? fillColor;
  final bool filled;
  final InputBorder? border;
  final InputBorder? enabledBorder;
  final InputBorder? focusedBorder;
  final InputBorder? errorBorder;
  final InputBorder? disabledBorder;
  final double borderRadius;
  final TextStyle? textStyle;
  final TextStyle? labelStyle;
  final TextStyle? hintStyle;
  final TextAlign textAlign;
  final bool autovalidate;
  final AutovalidateMode? autovalidateMode;

  const CustomTextField({
    super.key,
    this.controller,
    this.labelText,
    this.hintText,
    this.helperText,
    this.errorText,
    this.prefixIcon,
    this.prefix,
    this.suffixIcon,
    this.suffix,
    this.isPassword = false,
    this.readOnly = false,
    this.enabled = true,
    this.autofocus = false,
    this.showCounter = false,
    this.maxLines = 1,
    this.minLines,
    this.maxLength,
    this.keyboardType,
    this.textInputAction,
    this.textCapitalization = TextCapitalization.none,
    this.inputFormatters,
    this.validator,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.onEditingComplete,
    this.focusNode,
    this.initialValue,
    this.contentPadding,
    this.fillColor,
    this.filled = true,
    this.border,
    this.enabledBorder,
    this.focusedBorder,
    this.errorBorder,
    this.disabledBorder,
    this.borderRadius = 8.0,
    this.textStyle,
    this.labelStyle,
    this.hintStyle,
    this.textAlign = TextAlign.start,
    this.autovalidate = false,
    this.autovalidateMode,
  });

  @override
  State<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<CustomTextField> {
  bool _obscureText = true;
  late FocusNode _focusNode;

  @override
  void initState() {
    super.initState();
    _focusNode = widget.focusNode ?? FocusNode();
    _obscureText = widget.isPassword;
  }

  @override
  void dispose() {
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    super.dispose();
  }

  void _togglePasswordVisibility() {
    setState(() {
      _obscureText = !_obscureText;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return TextFormField(
      controller: widget.controller,
      initialValue: widget.initialValue,
      focusNode: _focusNode,
      enabled: widget.enabled,
      readOnly: widget.readOnly,
      autofocus: widget.autofocus,
      obscureText: widget.isPassword && _obscureText,
      maxLines: widget.isPassword ? 1 : widget.maxLines,
      minLines: widget.minLines,
      maxLength: widget.maxLength,
      keyboardType: widget.keyboardType ?? _getDefaultKeyboardType(),
      textInputAction: widget.textInputAction,
      textCapitalization: widget.textCapitalization,
      inputFormatters: widget.inputFormatters,
      validator: widget.validator,
      onChanged: widget.onChanged,
      onFieldSubmitted: widget.onSubmitted,
      onTap: widget.onTap,
      onEditingComplete: widget.onEditingComplete,
      style: widget.textStyle ?? theme.textTheme.bodyLarge,
      textAlign: widget.textAlign,
      autovalidateMode: widget.autovalidateMode ??
          (widget.autovalidate ? AutovalidateMode.always : AutovalidateMode.disabled),
      decoration: InputDecoration(
        labelText: widget.labelText,
        hintText: widget.hintText,
        helperText: widget.helperText,
        errorText: widget.errorText,
        prefixIcon: widget.prefixIcon != null
            ? Icon(widget.prefixIcon)
            : null,
        prefix: widget.prefix,
        suffixIcon: _buildSuffixIcon(),
        suffix: widget.suffix,
        filled: widget.filled,
        fillColor: widget.fillColor ??
            (widget.enabled
                ? theme.inputDecorationTheme.fillColor ?? Colors.grey[100]
                : Colors.grey[200]),
        contentPadding: widget.contentPadding ??
            const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
        border: widget.border ?? _buildBorder(theme.primaryColor),
        enabledBorder: widget.enabledBorder ??
            _buildBorder(Colors.grey[300]!),
        focusedBorder: widget.focusedBorder ??
            _buildBorder(theme.primaryColor, width: 2.0),
        errorBorder: widget.errorBorder ??
            _buildBorder(theme.colorScheme.error),
        focusedErrorBorder: _buildBorder(theme.colorScheme.error, width: 2.0),
        disabledBorder: widget.disabledBorder ??
            _buildBorder(Colors.grey[300]!),
        labelStyle: widget.labelStyle,
        hintStyle: widget.hintStyle ??
            TextStyle(color: Colors.grey[400]),
        errorMaxLines: 2,
        counterText: widget.showCounter ? null : '',
      ),
    );
  }

  TextInputType _getDefaultKeyboardType() {
    if (widget.isPassword) return TextInputType.visiblePassword;
    if (widget.maxLines != null && widget.maxLines! > 1) {
      return TextInputType.multiline;
    }
    return TextInputType.text;
  }

  Widget? _buildSuffixIcon() {
    if (widget.isPassword) {
      return IconButton(
        icon: Icon(
          _obscureText ? Icons.visibility_outlined : Icons.visibility_off_outlined,
          color: Colors.grey[600],
        ),
        onPressed: _togglePasswordVisibility,
      );
    }

    if (widget.suffixIcon != null) {
      return Icon(widget.suffixIcon);
    }

    return null;
  }

  InputBorder _buildBorder(Color color, {double width = 1.0}) {
    return OutlineInputBorder(
      borderRadius: BorderRadius.circular(widget.borderRadius),
      borderSide: BorderSide(
        color: color,
        width: width,
      ),
    );
  }
}

/// Predefined input formatters for common use cases
class InputFormatters {
  /// Allows only numeric input
  static final numeric = FilteringTextInputFormatter.digitsOnly;

  /// Allows only alphabetic characters
  static final alphabetic = FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z]'));

  /// Allows alphanumeric characters
  static final alphanumeric = FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9]'));

  /// Formats phone number (US format)
  static final phoneNumber = FilteringTextInputFormatter.allow(RegExp(r'[0-9+\-() ]'));

  /// Allows decimal numbers
  static final decimal = FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*'));

  /// Prevents whitespace
  static final noWhitespace = FilteringTextInputFormatter.deny(RegExp(r'\s'));

  /// Email format (allows common email characters)
  static final email = FilteringTextInputFormatter.allow(
    RegExp(r'[a-zA-Z0-9@._\-]'),
  );
}

/// Predefined validators for common use cases
class TextFieldValidators {
  /// Validates that field is not empty
  static String? Function(String?) required(String fieldName) {
    return (String? value) {
      if (value == null || value.trim().isEmpty) {
        return '$fieldName is required';
      }
      return null;
    };
  }

  /// Validates email format
  static String? email(String? value) {
    if (value == null || value.isEmpty) return null;

    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );

    if (!emailRegex.hasMatch(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  /// Validates phone number
  static String? phone(String? value) {
    if (value == null || value.isEmpty) return null;

    final phoneRegex = RegExp(r'^\+?[\d\s\-()]{10,}$');

    if (!phoneRegex.hasMatch(value)) {
      return 'Please enter a valid phone number';
    }
    return null;
  }

  /// Validates minimum length
  static String? Function(String?) minLength(int min, String fieldName) {
    return (String? value) {
      if (value == null || value.isEmpty) return null;

      if (value.length < min) {
        return '$fieldName must be at least $min characters';
      }
      return null;
    };
  }

  /// Validates maximum length
  static String? Function(String?) maxLength(int max, String fieldName) {
    return (String? value) {
      if (value == null || value.isEmpty) return null;

      if (value.length > max) {
        return '$fieldName must not exceed $max characters';
      }
      return null;
    };
  }

  /// Validates password strength
  static String? passwordStrength(String? value) {
    if (value == null || value.isEmpty) return null;

    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (!RegExp(r'[A-Z]').hasMatch(value)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!RegExp(r'[a-z]').hasMatch(value)) {
      return 'Password must contain at least one lowercase letter';
    }

    if (!RegExp(r'[0-9]').hasMatch(value)) {
      return 'Password must contain at least one number';
    }

    return null;
  }

  /// Validates that two fields match (e.g., password confirmation)
  static String? Function(String?) match(String value, String fieldName) {
    return (String? confirmValue) {
      if (confirmValue == null || confirmValue.isEmpty) return null;

      if (confirmValue != value) {
        return '$fieldName does not match';
      }
      return null;
    };
  }

  /// Combines multiple validators
  static String? Function(String?) combine(
    List<String? Function(String?)> validators,
  ) {
    return (String? value) {
      for (final validator in validators) {
        final result = validator(value);
        if (result != null) return result;
      }
      return null;
    };
  }
}
