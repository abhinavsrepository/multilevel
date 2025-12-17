/// Currency and financial utilities for formatting and calculations
library;

import 'package:intl/intl.dart';

class CurrencyUtils {
  CurrencyUtils._();

  static const String defaultCurrencySymbol = '₹';
  static const String defaultLocale = 'en_IN';

  /// Formats a number as currency with symbol
  /// Default: Indian Rupee (₹)
  static String formatCurrency(
    num? amount, {
    String symbol = defaultCurrencySymbol,
    int decimalDigits = 2,
    bool showSymbol = true,
  }) {
    if (amount == null) return '${showSymbol ? symbol : ''}0.00';

    final formatter = NumberFormat.currency(
      locale: defaultLocale,
      symbol: showSymbol ? symbol : '',
      decimalDigits: decimalDigits,
    );

    return formatter.format(amount);
  }

  /// Formats currency without decimals
  static String formatCurrencyCompact(
    num? amount, {
    String symbol = defaultCurrencySymbol,
  }) {
    return formatCurrency(amount, symbol: symbol, decimalDigits: 0);
  }

  /// Formats amount as Indian Rupee (alias for formatCurrency)
  static String formatINR(num? amount, {int decimalDigits = 2}) {
    return formatCurrency(amount, symbol: '₹', decimalDigits: decimalDigits);
  }

  /// Parses a currency string to double
  /// Removes currency symbols and formatting
  static double? parseCurrency(String? value) {
    if (value == null || value.isEmpty) return null;

    // Remove currency symbols, commas, and spaces
    final cleanedValue = value
        .replaceAll(RegExp(r'[₹$€£¥,\s]'), '')
        .trim();

    return double.tryParse(cleanedValue);
  }

  /// Converts amount to words (Indian number system)
  /// Example: 1000 -> "One Thousand Rupees"
  static String toWords(num? amount, {String currency = 'Rupees'}) {
    if (amount == null || amount == 0) return 'Zero $currency';

    final isNegative = amount < 0;
    final absoluteAmount = amount.abs().floor();

    final words = _convertNumberToWords(absoluteAmount);
    final result = '$words $currency';

    return isNegative ? 'Minus $result' : result;
  }

  /// Internal method to convert number to words
  static String _convertNumberToWords(int number) {
    if (number == 0) return 'Zero';

    final ones = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
    ];

    final teens = [
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];

    final tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];

    String convertLessThanThousand(int n) {
      if (n == 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) {
        return '${tens[n ~/ 10]} ${ones[n % 10]}'.trim();
      }
      return '${ones[n ~/ 100]} Hundred ${convertLessThanThousand(n % 100)}'
          .trim();
    }

    // Indian number system: Crore, Lakh, Thousand, Hundred
    final crore = number ~/ 10000000;
    final lakh = (number % 10000000) ~/ 100000;
    final thousand = (number % 100000) ~/ 1000;
    final hundred = number % 1000;

    final parts = <String>[];

    if (crore > 0) {
      parts.add('${convertLessThanThousand(crore)} Crore');
    }
    if (lakh > 0) {
      parts.add('${convertLessThanThousand(lakh)} Lakh');
    }
    if (thousand > 0) {
      parts.add('${convertLessThanThousand(thousand)} Thousand');
    }
    if (hundred > 0) {
      parts.add(convertLessThanThousand(hundred));
    }

    return parts.join(' ').trim();
  }

  /// Formats large numbers with abbreviations
  /// 1000 -> 1K, 1000000 -> 10L/1M, 10000000 -> 1Cr/10M
  static String formatLargeNumber(
    num? amount, {
    bool useIndianSystem = true,
    int decimalDigits = 2,
  }) {
    if (amount == null || amount == 0) return '0';

    final absoluteAmount = amount.abs();

    if (useIndianSystem) {
      // Indian system: K, L (Lakh), Cr (Crore)
      if (absoluteAmount >= 10000000) {
        // 1 Crore = 10,000,000
        return '${(absoluteAmount / 10000000).toStringAsFixed(decimalDigits)}Cr';
      } else if (absoluteAmount >= 100000) {
        // 1 Lakh = 100,000
        return '${(absoluteAmount / 100000).toStringAsFixed(decimalDigits)}L';
      } else if (absoluteAmount >= 1000) {
        return '${(absoluteAmount / 1000).toStringAsFixed(decimalDigits)}K';
      }
    } else {
      // International system: K, M, B, T
      if (absoluteAmount >= 1000000000000) {
        return '${(absoluteAmount / 1000000000000).toStringAsFixed(decimalDigits)}T';
      } else if (absoluteAmount >= 1000000000) {
        return '${(absoluteAmount / 1000000000).toStringAsFixed(decimalDigits)}B';
      } else if (absoluteAmount >= 1000000) {
        return '${(absoluteAmount / 1000000).toStringAsFixed(decimalDigits)}M';
      } else if (absoluteAmount >= 1000) {
        return '${(absoluteAmount / 1000).toStringAsFixed(decimalDigits)}K';
      }
    }

    return amount.toStringAsFixed(decimalDigits);
  }

  /// Calculates percentage
  /// Example: calculatePercentage(25, 100) = 25%
  static double calculatePercentage(num part, num whole) {
    if (whole == 0) return 0;
    return (part / whole) * 100;
  }

  /// Calculates percentage value
  /// Example: getPercentageValue(100, 20) = 20 (20% of 100)
  static double getPercentageValue(num amount, num percentage) {
    return (amount * percentage) / 100;
  }

  /// Calculates ROI (Return on Investment)
  /// Formula: ((Final Value - Initial Value) / Initial Value) * 100
  static double calculateROI(num initialValue, num finalValue) {
    if (initialValue == 0) return 0;
    return ((finalValue - initialValue) / initialValue) * 100;
  }

  /// Formats a number with specific decimal places
  static String formatDecimal(num? value, {int decimalPlaces = 2}) {
    if (value == null) return '0.${'0' * decimalPlaces}';
    return value.toStringAsFixed(decimalPlaces);
  }

  /// Formats a number with thousand separators
  /// Example: 1000000 -> 1,000,000
  static String formatWithCommas(num? value) {
    if (value == null) return '0';
    final formatter = NumberFormat('#,##,###', defaultLocale);
    return formatter.format(value);
  }

  /// Calculates simple interest
  /// Formula: (Principal * Rate * Time) / 100
  static double calculateSimpleInterest({
    required num principal,
    required num rate,
    required num time,
  }) {
    return (principal * rate * time) / 100;
  }

  /// Calculates compound interest
  /// Formula: P * (1 + r/n)^(n*t) - P
  static double calculateCompoundInterest({
    required num principal,
    required num rate,
    required num time,
    int compoundingFrequency = 1, // 1 = yearly, 4 = quarterly, 12 = monthly
  }) {
    final r = rate / 100;
    final n = compoundingFrequency;
    final t = time;

    final amount = principal *
        (1 + (r / n)).toDouble().pow((n * t).toInt());
    return amount - principal;
  }

  /// Calculates EMI (Equated Monthly Installment)
  /// Formula: [P * r * (1+r)^n] / [(1+r)^n-1]
  static double calculateEMI({
    required num principal,
    required num annualRate,
    required int tenureMonths,
  }) {
    if (annualRate == 0) {
      return principal / tenureMonths;
    }

    final monthlyRate = (annualRate / 12) / 100;
    final numerator =
        principal * monthlyRate * (1 + monthlyRate).toDouble().pow(tenureMonths);
    final denominator = (1 + monthlyRate).toDouble().pow(tenureMonths) - 1;

    return numerator / denominator;
  }

  /// Formats EMI breakdown
  static Map<String, double> getEMIBreakdown({
    required num principal,
    required num annualRate,
    required int tenureMonths,
  }) {
    final emi = calculateEMI(
      principal: principal,
      annualRate: annualRate,
      tenureMonths: tenureMonths,
    );

    final totalAmount = emi * tenureMonths;
    final totalInterest = totalAmount - principal;

    return {
      'emi': emi,
      'totalAmount': totalAmount,
      'totalInterest': totalInterest,
      'principal': principal.toDouble(),
    };
  }

  /// Adds two amounts safely
  static double add(num? amount1, num? amount2) {
    return ((amount1 ?? 0) + (amount2 ?? 0)).toDouble();
  }

  /// Subtracts two amounts safely
  static double subtract(num? amount1, num? amount2) {
    return ((amount1 ?? 0) - (amount2 ?? 0)).toDouble();
  }

  /// Multiplies amount by a factor
  static double multiply(num? amount, num? factor) {
    return ((amount ?? 0) * (factor ?? 0)).toDouble();
  }

  /// Divides amount by a divisor
  static double divide(num? amount, num? divisor) {
    if (divisor == null || divisor == 0) return 0;
    return (amount ?? 0) / divisor;
  }

  /// Rounds to nearest currency value (2 decimal places)
  static double roundToCurrency(num? amount) {
    if (amount == null) return 0.0;
    return (amount * 100).round() / 100;
  }
}

/// Extension for num to add pow method
extension NumExtension on num {
  double pow(int exponent) {
    if (exponent == 0) return 1.0;
    if (exponent == 1) return toDouble();

    double result = 1.0;
    final double base = toDouble();
    final int exp = exponent.abs();

    for (int i = 0; i < exp; i++) {
      result *= base;
    }

    return exponent < 0 ? 1 / result : result;
  }
}
