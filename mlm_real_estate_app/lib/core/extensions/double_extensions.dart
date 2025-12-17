import 'package:intl/intl.dart';

/// Double and num extension methods for number formatting and manipulation
extension DoubleExtensions on double {
  /// Converts the number to a currency string
  ///
  /// Example:
  /// ```dart
  /// 1234.56.toCurrency() // '₹1,234.56'
  /// 1234.56.toCurrency(symbol: '\$') // '\$1,234.56'
  /// ```
  String toCurrency({
    String symbol = '₹',
    int decimalDigits = 2,
    String locale = 'en_IN',
  }) {
    final formatter = NumberFormat.currency(
      symbol: symbol,
      decimalDigits: decimalDigits,
      locale: locale,
    );
    return formatter.format(this);
  }

  /// Converts the number to a compact format (1000 -> 1K, 1000000 -> 1M)
  ///
  /// Example:
  /// ```dart
  /// 1234.0.toCompact() // '1.23K'
  /// 1234567.0.toCompact() // '1.23M'
  /// ```
  String toCompact({String locale = 'en_IN'}) {
    final formatter = NumberFormat.compact(locale: locale);
    return formatter.format(this);
  }

  /// Converts the number to a percentage string
  ///
  /// Example:
  /// ```dart
  /// 0.75.toPercentage() // '75.00%'
  /// 0.75.toPercentage(decimalDigits: 0) // '75%'
  /// ```
  String toPercentage({
    int decimalDigits = 2,
    bool includeSymbol = true,
  }) {
    final value = this * 100;
    final formatted = value.toStringAsFixed(decimalDigits);
    return includeSymbol ? '$formatted%' : formatted;
  }

  /// Rounds the number to a specified number of decimal places
  ///
  /// Example:
  /// ```dart
  /// 1234.5678.toFixed(2) // '1234.57'
  /// ```
  String toFixed(int decimalPlaces) {
    return toStringAsFixed(decimalPlaces);
  }

  /// Converts the number to Indian rupee format
  ///
  /// Example:
  /// ```dart
  /// 1234567.89.toIndianRupee() // '₹12,34,567.89'
  /// ```
  String toIndianRupee({int decimalDigits = 2}) {
    final formatter = NumberFormat.currency(
      symbol: '₹',
      decimalDigits: decimalDigits,
      locale: 'en_IN',
    );
    return formatter.format(this);
  }

  /// Rounds the number to the nearest specified value
  ///
  /// Example:
  /// ```dart
  /// 1234.56.roundToNearest(10) // 1230.0
  /// 1234.56.roundToNearest(5) // 1235.0
  /// ```
  double roundToNearest(int nearest) {
    if (nearest == 0) return this;
    return (this / nearest).round() * nearest.toDouble();
  }

  /// Converts the number to a formatted string with thousand separators
  ///
  /// Example:
  /// ```dart
  /// 1234567.89.toFormattedString() // '1,234,567.89'
  /// ```
  String toFormattedString({
    int decimalDigits = 2,
    String locale = 'en_IN',
  }) {
    final formatter = NumberFormat.decimalPattern(locale);
    if (decimalDigits == 0) {
      return formatter.format(round());
    }
    return formatter.format(this);
  }

  /// Converts the number to words (Indian numbering system)
  ///
  /// Example:
  /// ```dart
  /// 1234567.0.toIndianWords() // '12.35 Lakh'
  /// ```
  String toIndianWords() {
    if (this >= 10000000) {
      return '${(this / 10000000).toStringAsFixed(2)} Crore';
    } else if (this >= 100000) {
      return '${(this / 100000).toStringAsFixed(2)} Lakh';
    } else if (this >= 1000) {
      return '${(this / 1000).toStringAsFixed(2)} Thousand';
    } else {
      return toStringAsFixed(2);
    }
  }

  /// Clamps the value between a minimum and maximum
  ///
  /// Example:
  /// ```dart
  /// 150.0.clampValue(0, 100) // 100.0
  /// ```
  double clampValue(num min, num max) {
    return clamp(min, max).toDouble();
  }

  /// Checks if the number is between two values (inclusive)
  ///
  /// Example:
  /// ```dart
  /// 50.0.isBetween(0, 100) // true
  /// ```
  bool isBetween(num min, num max) {
    return this >= min && this <= max;
  }

  /// Converts the number to a file size string
  ///
  /// Example:
  /// ```dart
  /// 1024.0.toFileSize() // '1.00 KB'
  /// 1048576.0.toFileSize() // '1.00 MB'
  /// ```
  String toFileSize() {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    var size = this;
    var unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return '${size.toStringAsFixed(2)} ${units[unitIndex]}';
  }

  /// Returns the absolute value
  ///
  /// Example:
  /// ```dart
  /// (-1234.56).absValue() // 1234.56
  /// ```
  double absValue() => abs();

  /// Checks if the number is negative
  ///
  /// Example:
  /// ```dart
  /// (-10.0).isNegative // true
  /// ```
  bool get isNegativeValue => this < 0;

  /// Checks if the number is positive
  ///
  /// Example:
  /// ```dart
  /// 10.0.isPositive // true
  /// ```
  bool get isPositiveValue => this > 0;

  /// Checks if the number is zero
  ///
  /// Example:
  /// ```dart
  /// 0.0.isZero // true
  /// ```
  bool get isZero => this == 0;

  /// Converts the number to a square footage string
  ///
  /// Example:
  /// ```dart
  /// 1500.0.toSqFt() // '1,500 sq.ft'
  /// ```
  String toSqFt() {
    return '${toFormattedString(decimalDigits: 0)} sq.ft';
  }

  /// Converts the number to a square meter string
  ///
  /// Example:
  /// ```dart
  /// 100.0.toSqM() // '100 sq.m'
  /// ```
  String toSqM() {
    return '${toFormattedString(decimalDigits: 0)} sq.m';
  }
}

/// Integer extension methods
extension IntExtensions on int {
  /// Converts the integer to a currency string
  ///
  /// Example:
  /// ```dart
  /// 1234.toCurrency() // '₹1,234.00'
  /// ```
  String toCurrency({
    String symbol = '₹',
    int decimalDigits = 0,
    String locale = 'en_IN',
  }) {
    return toDouble().toCurrency(
      symbol: symbol,
      decimalDigits: decimalDigits,
      locale: locale,
    );
  }

  /// Converts the integer to a compact format
  ///
  /// Example:
  /// ```dart
  /// 1234.toCompact() // '1.23K'
  /// ```
  String toCompact({String locale = 'en_IN'}) {
    return toDouble().toCompact(locale: locale);
  }

  /// Converts the integer to Indian rupee format
  ///
  /// Example:
  /// ```dart
  /// 1234567.toIndianRupee() // '₹12,34,567'
  /// ```
  String toIndianRupee({int decimalDigits = 0}) {
    return toDouble().toIndianRupee(decimalDigits: decimalDigits);
  }

  /// Converts the integer to a formatted string with thousand separators
  ///
  /// Example:
  /// ```dart
  /// 1234567.toFormattedString() // '1,234,567'
  /// ```
  String toFormattedString({String locale = 'en_IN'}) {
    final formatter = NumberFormat.decimalPattern(locale);
    return formatter.format(this);
  }

  /// Converts the integer to Indian words
  ///
  /// Example:
  /// ```dart
  /// 1234567.toIndianWords() // '12.35 Lakh'
  /// ```
  String toIndianWords() {
    return toDouble().toIndianWords();
  }

  /// Checks if the number is even
  ///
  /// Example:
  /// ```dart
  /// 10.isEven // true
  /// ```
  bool get isEvenNumber => this % 2 == 0;

  /// Checks if the number is odd
  ///
  /// Example:
  /// ```dart
  /// 11.isOdd // true
  /// ```
  bool get isOddNumber => this % 2 != 0;

  /// Converts the integer to a file size string
  ///
  /// Example:
  /// ```dart
  /// 1024.toFileSize() // '1.00 KB'
  /// ```
  String toFileSize() {
    return toDouble().toFileSize();
  }

  /// Converts the integer to ordinal string (1st, 2nd, 3rd, etc.)
  ///
  /// Example:
  /// ```dart
  /// 1.toOrdinal() // '1st'
  /// 2.toOrdinal() // '2nd'
  /// 3.toOrdinal() // '3rd'
  /// ```
  String toOrdinal() {
    if (this % 100 >= 11 && this % 100 <= 13) {
      return '${this}th';
    }
    switch (this % 10) {
      case 1:
        return '${this}st';
      case 2:
        return '${this}nd';
      case 3:
        return '${this}rd';
      default:
        return '${this}th';
    }
  }

  /// Returns a list of integers from 0 to this number
  ///
  /// Example:
  /// ```dart
  /// 5.toList() // [0, 1, 2, 3, 4]
  /// ```
  List<int> toList() {
    return List.generate(this, (index) => index);
  }

  /// Executes a function n times
  ///
  /// Example:
  /// ```dart
  /// 3.times(() => print('Hello')); // Prints 'Hello' 3 times
  /// ```
  void times(void Function() action) {
    for (var i = 0; i < this; i++) {
      action();
    }
  }
}

/// Nullable double extension methods
extension NullableDoubleExtensions on double? {
  /// Returns the value or zero if null
  ///
  /// Example:
  /// ```dart
  /// double? value = null;
  /// value.orZero() // 0.0
  /// ```
  double orZero() => this ?? 0.0;

  /// Returns the value or a default value if null
  ///
  /// Example:
  /// ```dart
  /// double? value = null;
  /// value.orDefault(10.0) // 10.0
  /// ```
  double orDefault(double defaultValue) => this ?? defaultValue;

  /// Checks if the value is null or zero
  ///
  /// Example:
  /// ```dart
  /// double? value = null;
  /// value.isNullOrZero // true
  /// ```
  bool get isNullOrZero => this == null || this == 0.0;
}

/// Nullable int extension methods
extension NullableIntExtensions on int? {
  /// Returns the value or zero if null
  ///
  /// Example:
  /// ```dart
  /// int? value = null;
  /// value.orZero() // 0
  /// ```
  int orZero() => this ?? 0;

  /// Returns the value or a default value if null
  ///
  /// Example:
  /// ```dart
  /// int? value = null;
  /// value.orDefault(10) // 10
  /// ```
  int orDefault(int defaultValue) => this ?? defaultValue;

  /// Checks if the value is null or zero
  ///
  /// Example:
  /// ```dart
  /// int? value = null;
  /// value.isNullOrZero // true
  /// ```
  bool get isNullOrZero => this == null || this == 0;
}
