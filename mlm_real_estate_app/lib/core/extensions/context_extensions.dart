import 'package:flutter/material.dart';

/// BuildContext extension methods for easier access to common operations
extension ContextExtensions on BuildContext {
  // MediaQuery shortcuts

  /// Returns the screen size
  ///
  /// Example:
  /// ```dart
  /// context.screenSize // Size(width, height)
  /// ```
  Size get screenSize => MediaQuery.of(this).size;

  /// Returns the screen width
  ///
  /// Example:
  /// ```dart
  /// context.screenWidth // 375.0
  /// ```
  double get screenWidth => screenSize.width;

  /// Returns the screen height
  ///
  /// Example:
  /// ```dart
  /// context.screenHeight // 812.0
  /// ```
  double get screenHeight => screenSize.height;

  /// Returns the safe area padding
  ///
  /// Example:
  /// ```dart
  /// context.padding // EdgeInsets
  /// ```
  EdgeInsets get padding => MediaQuery.of(this).padding;

  /// Returns the view insets (keyboard height, etc.)
  ///
  /// Example:
  /// ```dart
  /// context.viewInsets // EdgeInsets
  /// ```
  EdgeInsets get viewInsets => MediaQuery.of(this).viewInsets;

  /// Returns the view padding
  ///
  /// Example:
  /// ```dart
  /// context.viewPadding // EdgeInsets
  /// ```
  EdgeInsets get viewPadding => MediaQuery.of(this).viewPadding;

  /// Returns the device pixel ratio
  ///
  /// Example:
  /// ```dart
  /// context.devicePixelRatio // 2.0
  /// ```
  double get devicePixelRatio => MediaQuery.of(this).devicePixelRatio;

  /// Returns the text scale factor
  ///
  /// Example:
  /// ```dart
  /// context.textScaleFactor // 1.0
  /// ```
  double get textScaleFactor => MediaQuery.of(this).textScaleFactor;

  /// Returns the orientation
  ///
  /// Example:
  /// ```dart
  /// context.orientation // Orientation.portrait
  /// ```
  Orientation get orientation => MediaQuery.of(this).orientation;

  /// Checks if the device is in portrait mode
  ///
  /// Example:
  /// ```dart
  /// context.isPortrait // true
  /// ```
  bool get isPortrait => orientation == Orientation.portrait;

  /// Checks if the device is in landscape mode
  ///
  /// Example:
  /// ```dart
  /// context.isLandscape // true
  /// ```
  bool get isLandscape => orientation == Orientation.landscape;

  /// Returns the keyboard height
  ///
  /// Example:
  /// ```dart
  /// context.keyboardHeight // 300.0
  /// ```
  double get keyboardHeight => viewInsets.bottom;

  /// Checks if the keyboard is visible
  ///
  /// Example:
  /// ```dart
  /// context.isKeyboardVisible // true
  /// ```
  bool get isKeyboardVisible => keyboardHeight > 0;

  // Theme shortcuts

  /// Returns the theme data
  ///
  /// Example:
  /// ```dart
  /// context.theme // ThemeData
  /// ```
  ThemeData get theme => Theme.of(this);

  /// Returns the text theme
  ///
  /// Example:
  /// ```dart
  /// context.textTheme // TextTheme
  /// ```
  TextTheme get textTheme => theme.textTheme;

  /// Returns the color scheme
  ///
  /// Example:
  /// ```dart
  /// context.colorScheme // ColorScheme
  /// ```
  ColorScheme get colorScheme => theme.colorScheme;

  /// Returns the primary color
  ///
  /// Example:
  /// ```dart
  /// context.primaryColor // Color
  /// ```
  Color get primaryColor => colorScheme.primary;

  /// Returns the secondary color
  ///
  /// Example:
  /// ```dart
  /// context.secondaryColor // Color
  /// ```
  Color get secondaryColor => colorScheme.secondary;

  /// Returns the background color
  ///
  /// Example:
  /// ```dart
  /// context.backgroundColor // Color
  /// ```
  Color get backgroundColor => colorScheme.surface;

  /// Returns the surface color
  ///
  /// Example:
  /// ```dart
  /// context.surfaceColor // Color
  /// ```
  Color get surfaceColor => colorScheme.surface;

  /// Returns the error color
  ///
  /// Example:
  /// ```dart
  /// context.errorColor // Color
  /// ```
  Color get errorColor => colorScheme.error;

  /// Returns the scaffold background color
  ///
  /// Example:
  /// ```dart
  /// context.scaffoldBackgroundColor // Color
  /// ```
  Color get scaffoldBackgroundColor => theme.scaffoldBackgroundColor;

  /// Returns the card color
  ///
  /// Example:
  /// ```dart
  /// context.cardColor // Color
  /// ```
  Color get cardColor => theme.cardColor;

  /// Returns the divider color
  ///
  /// Example:
  /// ```dart
  /// context.dividerColor // Color
  /// ```
  Color get dividerColor => theme.dividerColor;

  /// Checks if the theme is dark mode
  ///
  /// Example:
  /// ```dart
  /// context.isDarkMode // true
  /// ```
  bool get isDarkMode => theme.brightness == Brightness.dark;

  /// Checks if the theme is light mode
  ///
  /// Example:
  /// ```dart
  /// context.isLightMode // true
  /// ```
  bool get isLightMode => theme.brightness == Brightness.light;

  // Text styles shortcuts

  /// Returns the display large text style
  ///
  /// Example:
  /// ```dart
  /// context.displayLarge // TextStyle
  /// ```
  TextStyle? get displayLarge => textTheme.displayLarge;

  /// Returns the display medium text style
  ///
  /// Example:
  /// ```dart
  /// context.displayMedium // TextStyle
  /// ```
  TextStyle? get displayMedium => textTheme.displayMedium;

  /// Returns the display small text style
  ///
  /// Example:
  /// ```dart
  /// context.displaySmall // TextStyle
  /// ```
  TextStyle? get displaySmall => textTheme.displaySmall;

  /// Returns the headline large text style
  ///
  /// Example:
  /// ```dart
  /// context.headlineLarge // TextStyle
  /// ```
  TextStyle? get headlineLarge => textTheme.headlineLarge;

  /// Returns the headline medium text style
  ///
  /// Example:
  /// ```dart
  /// context.headlineMedium // TextStyle
  /// ```
  TextStyle? get headlineMedium => textTheme.headlineMedium;

  /// Returns the headline small text style
  ///
  /// Example:
  /// ```dart
  /// context.headlineSmall // TextStyle
  /// ```
  TextStyle? get headlineSmall => textTheme.headlineSmall;

  /// Returns the title large text style
  ///
  /// Example:
  /// ```dart
  /// context.titleLarge // TextStyle
  /// ```
  TextStyle? get titleLarge => textTheme.titleLarge;

  /// Returns the title medium text style
  ///
  /// Example:
  /// ```dart
  /// context.titleMedium // TextStyle
  /// ```
  TextStyle? get titleMedium => textTheme.titleMedium;

  /// Returns the title small text style
  ///
  /// Example:
  /// ```dart
  /// context.titleSmall // TextStyle
  /// ```
  TextStyle? get titleSmall => textTheme.titleSmall;

  /// Returns the body large text style
  ///
  /// Example:
  /// ```dart
  /// context.bodyLarge // TextStyle
  /// ```
  TextStyle? get bodyLarge => textTheme.bodyLarge;

  /// Returns the body medium text style
  ///
  /// Example:
  /// ```dart
  /// context.bodyMedium // TextStyle
  /// ```
  TextStyle? get bodyMedium => textTheme.bodyMedium;

  /// Returns the body small text style
  ///
  /// Example:
  /// ```dart
  /// context.bodySmall // TextStyle
  /// ```
  TextStyle? get bodySmall => textTheme.bodySmall;

  /// Returns the label large text style
  ///
  /// Example:
  /// ```dart
  /// context.labelLarge // TextStyle
  /// ```
  TextStyle? get labelLarge => textTheme.labelLarge;

  /// Returns the label medium text style
  ///
  /// Example:
  /// ```dart
  /// context.labelMedium // TextStyle
  /// ```
  TextStyle? get labelMedium => textTheme.labelMedium;

  /// Returns the label small text style
  ///
  /// Example:
  /// ```dart
  /// context.labelSmall // TextStyle
  /// ```
  TextStyle? get labelSmall => textTheme.labelSmall;

  // Navigation shortcuts

  /// Pushes a new route
  ///
  /// Example:
  /// ```dart
  /// context.push(MyScreen())
  /// ```
  Future<T?> push<T extends Object?>(Widget page) {
    return Navigator.of(this).push<T>(
      MaterialPageRoute(builder: (context) => page),
    );
  }

  /// Pushes a named route
  ///
  /// Example:
  /// ```dart
  /// context.pushNamed('/home')
  /// ```
  Future<T?> pushNamed<T extends Object?>(
    String routeName, {
    Object? arguments,
  }) {
    return Navigator.of(this).pushNamed<T>(
      routeName,
      arguments: arguments,
    );
  }

  /// Pushes a new route and removes all previous routes
  ///
  /// Example:
  /// ```dart
  /// context.pushAndRemoveUntil(MyScreen())
  /// ```
  Future<T?> pushAndRemoveUntil<T extends Object?>(
    Widget page, {
    bool Function(Route<dynamic>)? predicate,
  }) {
    return Navigator.of(this).pushAndRemoveUntil<T>(
      MaterialPageRoute(builder: (context) => page),
      predicate ?? (route) => false,
    );
  }

  /// Pushes a replacement route
  ///
  /// Example:
  /// ```dart
  /// context.pushReplacement(MyScreen())
  /// ```
  Future<T?> pushReplacement<T extends Object?, TO extends Object?>(
    Widget page, {
    TO? result,
  }) {
    return Navigator.of(this).pushReplacement<T, TO>(
      MaterialPageRoute(builder: (context) => page),
      result: result,
    );
  }

  /// Pops the current route
  ///
  /// Example:
  /// ```dart
  /// context.pop()
  /// ```
  void pop<T extends Object?>([T? result]) {
    return Navigator.of(this).pop<T>(result);
  }

  /// Checks if the navigator can pop
  ///
  /// Example:
  /// ```dart
  /// context.canPop() // true
  /// ```
  bool canPop() {
    return Navigator.of(this).canPop();
  }

  /// Pops until a specific route
  ///
  /// Example:
  /// ```dart
  /// context.popUntil('/home')
  /// ```
  void popUntil(String routeName) {
    Navigator.of(this).popUntil(ModalRoute.withName(routeName));
  }

  // Dialog and bottom sheet shortcuts

  /// Shows a dialog
  ///
  /// Example:
  /// ```dart
  /// context.showCustomDialog(MyDialog())
  /// ```
  Future<T?> showCustomDialog<T>({
    required Widget dialog,
    bool barrierDismissible = true,
  }) {
    return showDialog<T>(
      context: this,
      barrierDismissible: barrierDismissible,
      builder: (context) => dialog,
    );
  }

  /// Shows an alert dialog
  ///
  /// Example:
  /// ```dart
  /// context.showAlertDialog(
  ///   title: 'Title',
  ///   content: 'Content',
  /// )
  /// ```
  Future<T?> showAlertDialog<T>({
    String? title,
    String? content,
    List<Widget>? actions,
  }) {
    return showDialog<T>(
      context: this,
      builder: (context) => AlertDialog(
        title: title != null ? Text(title) : null,
        content: content != null ? Text(content) : null,
        actions: actions,
      ),
    );
  }

  /// Shows a bottom sheet
  ///
  /// Example:
  /// ```dart
  /// context.showBottomSheet(MyBottomSheet())
  /// ```
  Future<T?> showBottomSheet<T>({
    required Widget child,
    bool isDismissible = true,
    bool enableDrag = true,
  }) {
    return showModalBottomSheet<T>(
      context: this,
      isDismissible: isDismissible,
      enableDrag: enableDrag,
      builder: (context) => child,
    );
  }

  /// Shows a snackbar
  ///
  /// Example:
  /// ```dart
  /// context.showSnackBar('Message')
  /// ```
  void showSnackBar(
    String message, {
    Duration duration = const Duration(seconds: 3),
    SnackBarAction? action,
  }) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: duration,
        action: action,
      ),
    );
  }

  /// Shows an error snackbar
  ///
  /// Example:
  /// ```dart
  /// context.showErrorSnackBar('Error message')
  /// ```
  void showErrorSnackBar(String message) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: errorColor,
        duration: const Duration(seconds: 4),
      ),
    );
  }

  /// Shows a success snackbar
  ///
  /// Example:
  /// ```dart
  /// context.showSuccessSnackBar('Success message')
  /// ```
  void showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  // Focus and keyboard shortcuts

  /// Hides the keyboard
  ///
  /// Example:
  /// ```dart
  /// context.hideKeyboard()
  /// ```
  void hideKeyboard() {
    FocusScope.of(this).unfocus();
  }

  /// Unfocuses the current focus
  ///
  /// Example:
  /// ```dart
  /// context.unfocus()
  /// ```
  void unfocus() {
    FocusScope.of(this).unfocus();
  }

  /// Requests focus for a node
  ///
  /// Example:
  /// ```dart
  /// context.requestFocus(myFocusNode)
  /// ```
  void requestFocus(FocusNode node) {
    FocusScope.of(this).requestFocus(node);
  }

  // Locale shortcuts

  /// Returns the locale
  ///
  /// Example:
  /// ```dart
  /// context.locale // Locale('en', 'US')
  /// ```
  Locale get locale => Localizations.localeOf(this);

  /// Returns the language code
  ///
  /// Example:
  /// ```dart
  /// context.languageCode // 'en'
  /// ```
  String get languageCode => locale.languageCode;

  /// Returns the country code
  ///
  /// Example:
  /// ```dart
  /// context.countryCode // 'US'
  /// ```
  String? get countryCode => locale.countryCode;

  // Responsive design helpers

  /// Checks if the screen is small (width < 600)
  ///
  /// Example:
  /// ```dart
  /// context.isSmallScreen // true
  /// ```
  bool get isSmallScreen => screenWidth < 600;

  /// Checks if the screen is medium (600 <= width < 1200)
  ///
  /// Example:
  /// ```dart
  /// context.isMediumScreen // true
  /// ```
  bool get isMediumScreen => screenWidth >= 600 && screenWidth < 1200;

  /// Checks if the screen is large (width >= 1200)
  ///
  /// Example:
  /// ```dart
  /// context.isLargeScreen // true
  /// ```
  bool get isLargeScreen => screenWidth >= 1200;

  /// Returns a value based on screen size
  ///
  /// Example:
  /// ```dart
  /// context.responsive(
  ///   small: 16.0,
  ///   medium: 18.0,
  ///   large: 20.0,
  /// )
  /// ```
  T responsive<T>({
    required T small,
    T? medium,
    T? large,
  }) {
    if (isLargeScreen && large != null) {
      return large;
    } else if (isMediumScreen && medium != null) {
      return medium;
    }
    return small;
  }

  /// Returns the horizontal padding based on screen size
  ///
  /// Example:
  /// ```dart
  /// context.horizontalPadding // 16.0 or 24.0 or 32.0
  /// ```
  double get horizontalPadding {
    return responsive(small: 16.0, medium: 24.0, large: 32.0);
  }

  /// Returns the vertical padding based on screen size
  ///
  /// Example:
  /// ```dart
  /// context.verticalPadding // 16.0 or 20.0 or 24.0
  /// ```
  double get verticalPadding {
    return responsive(small: 16.0, medium: 20.0, large: 24.0);
  }
}
