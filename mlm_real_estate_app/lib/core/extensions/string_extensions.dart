/// String extension methods for common string operations
extension StringExtensions on String {
  /// Capitalizes the first letter of the string
  ///
  /// Example:
  /// ```dart
  /// 'hello'.capitalize() // 'Hello'
  /// ```
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  /// Capitalizes the first letter of each word
  ///
  /// Example:
  /// ```dart
  /// 'hello world'.capitalizeWords() // 'Hello World'
  /// ```
  String capitalizeWords() {
    if (isEmpty) return this;
    return split(' ')
        .map((word) => word.isEmpty ? word : word.capitalize())
        .join(' ');
  }

  /// Checks if the string is a valid email address
  ///
  /// Example:
  /// ```dart
  /// 'test@example.com'.isValidEmail // true
  /// 'invalid'.isValidEmail // false
  /// ```
  bool get isValidEmail {
    if (isEmpty) return false;
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(this);
  }

  /// Checks if the string is a valid mobile number (10 digits)
  ///
  /// Example:
  /// ```dart
  /// '9876543210'.isValidMobile // true
  /// '123'.isValidMobile // false
  /// ```
  bool get isValidMobile {
    if (isEmpty) return false;
    final mobileRegex = RegExp(r'^[6-9]\d{9}$');
    return mobileRegex.hasMatch(this);
  }

  /// Checks if the string is a valid URL
  ///
  /// Example:
  /// ```dart
  /// 'https://example.com'.isValidUrl // true
  /// 'not a url'.isValidUrl // false
  /// ```
  bool get isValidUrl {
    if (isEmpty) return false;
    final urlRegex = RegExp(
      r'^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$',
    );
    return urlRegex.hasMatch(this);
  }

  /// Truncates the string to the specified length and adds ellipsis
  ///
  /// Example:
  /// ```dart
  /// 'Hello World'.truncate(5) // 'Hello...'
  /// ```
  String truncate(int maxLength, {String ellipsis = '...'}) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength)}$ellipsis';
  }

  /// Removes all whitespace from the string
  ///
  /// Example:
  /// ```dart
  /// 'hello world'.removeWhitespace() // 'helloworld'
  /// ```
  String removeWhitespace() {
    return replaceAll(RegExp(r'\s+'), '');
  }

  /// Converts the string to title case
  ///
  /// Example:
  /// ```dart
  /// 'hello world'.toTitleCase() // 'Hello World'
  /// ```
  String toTitleCase() {
    if (isEmpty) return this;
    return toLowerCase()
        .split(' ')
        .map((word) => word.isEmpty ? word : word.capitalize())
        .join(' ');
  }

  /// Safely parses the string to an integer
  ///
  /// Example:
  /// ```dart
  /// '123'.toIntOrNull() // 123
  /// 'abc'.toIntOrNull() // null
  /// ```
  int? toIntOrNull() {
    return int.tryParse(this);
  }

  /// Safely parses the string to a double
  ///
  /// Example:
  /// ```dart
  /// '123.45'.toDoubleOrNull() // 123.45
  /// 'abc'.toDoubleOrNull() // null
  /// ```
  double? toDoubleOrNull() {
    return double.tryParse(this);
  }

  /// Checks if the string contains only numeric characters
  ///
  /// Example:
  /// ```dart
  /// '123'.isNumeric // true
  /// '12.34'.isNumeric // false
  /// 'abc'.isNumeric // false
  /// ```
  bool get isNumeric {
    if (isEmpty) return false;
    return RegExp(r'^\d+$').hasMatch(this);
  }

  /// Checks if the string is a valid number (including decimals)
  ///
  /// Example:
  /// ```dart
  /// '123'.isNumber // true
  /// '12.34'.isNumber // true
  /// 'abc'.isNumber // false
  /// ```
  bool get isNumber {
    if (isEmpty) return false;
    return double.tryParse(this) != null;
  }

  /// Removes all HTML tags from the string
  ///
  /// Example:
  /// ```dart
  /// '<p>Hello</p>'.removeHtmlTags() // 'Hello'
  /// ```
  String removeHtmlTags() {
    final htmlRegex = RegExp(r'<[^>]*>');
    return replaceAll(htmlRegex, '');
  }

  /// Masks the email address for privacy
  ///
  /// Example:
  /// ```dart
  /// 'test@example.com'.maskEmail() // 't***@example.com'
  /// ```
  String maskEmail() {
    if (!isValidEmail) return this;

    final parts = split('@');
    final username = parts[0];
    final domain = parts[1];

    if (username.length <= 1) {
      return '${username[0]}***@$domain';
    }

    return '${username[0]}${'*' * (username.length - 1)}@$domain';
  }

  /// Masks the mobile number for privacy
  ///
  /// Example:
  /// ```dart
  /// '9876543210'.maskMobile() // '987****210'
  /// ```
  String maskMobile() {
    if (length < 10) return this;

    final first = substring(0, 3);
    final last = substring(length - 3);

    return '$first${'*' * (length - 6)}$last';
  }

  /// Checks if the string is null or empty
  ///
  /// Example:
  /// ```dart
  /// ''.isNullOrEmpty // true
  /// 'hello'.isNullOrEmpty // false
  /// ```
  bool get isNullOrEmpty => isEmpty;

  /// Checks if the string is null, empty, or contains only whitespace
  ///
  /// Example:
  /// ```dart
  /// '   '.isNullOrWhitespace // true
  /// 'hello'.isNullOrWhitespace // false
  /// ```
  bool get isNullOrWhitespace => trim().isEmpty;

  /// Reverses the string
  ///
  /// Example:
  /// ```dart
  /// 'hello'.reverse() // 'olleh'
  /// ```
  String reverse() {
    return split('').reversed.join('');
  }

  /// Converts the string to snake_case
  ///
  /// Example:
  /// ```dart
  /// 'HelloWorld'.toSnakeCase() // 'hello_world'
  /// ```
  String toSnakeCase() {
    return replaceAllMapped(
      RegExp(r'([A-Z])'),
      (match) => '_${match.group(0)!.toLowerCase()}',
    ).replaceFirst(RegExp(r'^_'), '');
  }

  /// Converts the string to camelCase
  ///
  /// Example:
  /// ```dart
  /// 'hello_world'.toCamelCase() // 'helloWorld'
  /// ```
  String toCamelCase() {
    if (isEmpty) return this;
    final words = split('_');
    if (words.length == 1) return this;

    return words.first +
        words
            .skip(1)
            .map((word) => word.capitalize())
            .join('');
  }

  /// Extracts numbers from the string
  ///
  /// Example:
  /// ```dart
  /// 'Price: 1234.56'.extractNumbers() // '1234.56'
  /// ```
  String extractNumbers() {
    return replaceAll(RegExp(r'[^0-9.]'), '');
  }

  /// Checks if the string contains another string (case insensitive)
  ///
  /// Example:
  /// ```dart
  /// 'Hello World'.containsIgnoreCase('WORLD') // true
  /// ```
  bool containsIgnoreCase(String other) {
    return toLowerCase().contains(other.toLowerCase());
  }

  /// Repeats the string n times
  ///
  /// Example:
  /// ```dart
  /// 'ha'.repeat(3) // 'hahaha'
  /// ```
  String repeat(int times) {
    if (times <= 0) return '';
    return List.filled(times, this).join();
  }
}

/// Nullable string extension methods
extension NullableStringExtensions on String? {
  /// Checks if the string is null or empty
  ///
  /// Example:
  /// ```dart
  /// String? str = null;
  /// str.isNullOrEmpty // true
  /// ```
  bool get isNullOrEmpty => this == null || this!.isEmpty;

  /// Checks if the string is null, empty, or contains only whitespace
  ///
  /// Example:
  /// ```dart
  /// String? str = '   ';
  /// str.isNullOrWhitespace // true
  /// ```
  bool get isNullOrWhitespace => this == null || this!.trim().isEmpty;

  /// Returns the string or a default value if null or empty
  ///
  /// Example:
  /// ```dart
  /// String? str = null;
  /// str.orDefault('default') // 'default'
  /// ```
  String orDefault(String defaultValue) {
    return isNullOrEmpty ? defaultValue : this!;
  }
}
