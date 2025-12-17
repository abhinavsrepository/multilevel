import 'package:intl/intl.dart';

/// DateTime extension methods for date and time manipulation
extension DateTimeExtensions on DateTime {
  /// Converts the date to a formatted string
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().toFormattedString() // '22 Nov 2025'
  /// DateTime.now().toFormattedString('dd-MM-yyyy') // '22-11-2025'
  /// ```
  String toFormattedString([String pattern = 'dd MMM yyyy']) {
    return DateFormat(pattern).format(this);
  }

  /// Alias for toFormattedString() - formats date as 'dd MMM yyyy'
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().formatDate() // '22 Nov 2025'
  /// ```
  String formatDate() {
    return toFormattedString();
  }

  /// Converts the date to a time string
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().toTimeString() // '14:30'
  /// DateTime.now().toTimeString('hh:mm a') // '02:30 PM'
  /// ```
  String toTimeString([String pattern = 'HH:mm']) {
    return DateFormat(pattern).format(this);
  }

  /// Converts the date to a date-time string
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().toDateTimeString() // '22 Nov 2025, 14:30'
  /// ```
  String toDateTimeString([String pattern = 'dd MMM yyyy, HH:mm']) {
    return DateFormat(pattern).format(this);
  }

  /// Returns a relative time string (e.g., "2 hours ago", "in 3 days")
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().subtract(Duration(hours: 2)).timeAgo() // '2 hours ago'
  /// ```
  String timeAgo() {
    final now = DateTime.now();
    final difference = now.difference(this);

    if (difference.isNegative) {
      return timeUntil();
    }

    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      final minutes = difference.inMinutes;
      return '$minutes ${minutes == 1 ? 'minute' : 'minutes'} ago';
    } else if (difference.inHours < 24) {
      final hours = difference.inHours;
      return '$hours ${hours == 1 ? 'hour' : 'hours'} ago';
    } else if (difference.inDays < 7) {
      final days = difference.inDays;
      return '$days ${days == 1 ? 'day' : 'days'} ago';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return '$weeks ${weeks == 1 ? 'week' : 'weeks'} ago';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return '$months ${months == 1 ? 'month' : 'months'} ago';
    } else {
      final years = (difference.inDays / 365).floor();
      return '$years ${years == 1 ? 'year' : 'years'} ago';
    }
  }

  /// Returns a relative time string for future dates (e.g., "in 2 hours", "in 3 days")
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().add(Duration(hours: 2)).timeUntil() // 'in 2 hours'
  /// ```
  String timeUntil() {
    final now = DateTime.now();
    final difference = this.difference(now);

    if (difference.isNegative) {
      return timeAgo();
    }

    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      final minutes = difference.inMinutes;
      return 'in $minutes ${minutes == 1 ? 'minute' : 'minutes'}';
    } else if (difference.inHours < 24) {
      final hours = difference.inHours;
      return 'in $hours ${hours == 1 ? 'hour' : 'hours'}';
    } else if (difference.inDays < 7) {
      final days = difference.inDays;
      return 'in $days ${days == 1 ? 'day' : 'days'}';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return 'in $weeks ${weeks == 1 ? 'week' : 'weeks'}';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return 'in $months ${months == 1 ? 'month' : 'months'}';
    } else {
      final years = (difference.inDays / 365).floor();
      return 'in $years ${years == 1 ? 'year' : 'years'}';
    }
  }

  /// Checks if the date is today
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().isToday // true
  /// ```
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  /// Checks if the date is yesterday
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().subtract(Duration(days: 1)).isYesterday // true
  /// ```
  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return year == yesterday.year &&
        month == yesterday.month &&
        day == yesterday.day;
  }

  /// Checks if the date is tomorrow
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().add(Duration(days: 1)).isTomorrow // true
  /// ```
  bool get isTomorrow {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    return year == tomorrow.year &&
        month == tomorrow.month &&
        day == tomorrow.day;
  }

  /// Checks if the date is in the current week
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().isThisWeek // true
  /// ```
  bool get isThisWeek {
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
    final endOfWeek = startOfWeek.add(const Duration(days: 6));

    return isAfter(startOfWeek.startOfDay) &&
        isBefore(endOfWeek.endOfDay);
  }

  /// Checks if the date is in the current month
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().isThisMonth // true
  /// ```
  bool get isThisMonth {
    final now = DateTime.now();
    return year == now.year && month == now.month;
  }

  /// Checks if the date is in the current year
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().isThisYear // true
  /// ```
  bool get isThisYear {
    final now = DateTime.now();
    return year == now.year;
  }

  /// Adds the specified number of days to the date
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().addDays(5) // 5 days from now
  /// ```
  DateTime addDays(int days) {
    return add(Duration(days: days));
  }

  /// Subtracts the specified number of days from the date
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().subtractDays(5) // 5 days ago
  /// ```
  DateTime subtractDays(int days) {
    return subtract(Duration(days: days));
  }

  /// Adds the specified number of months to the date
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().addMonths(2) // 2 months from now
  /// ```
  DateTime addMonths(int months) {
    final newMonth = month + months;
    final yearDiff = (newMonth - 1) ~/ 12;
    final finalMonth = ((newMonth - 1) % 12) + 1;

    return DateTime(
      year + yearDiff,
      finalMonth,
      day,
      hour,
      minute,
      second,
      millisecond,
      microsecond,
    );
  }

  /// Subtracts the specified number of months from the date
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().subtractMonths(2) // 2 months ago
  /// ```
  DateTime subtractMonths(int months) {
    return addMonths(-months);
  }

  /// Adds the specified number of years to the date
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().addYears(1) // 1 year from now
  /// ```
  DateTime addYears(int years) {
    return DateTime(
      year + years,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      microsecond,
    );
  }

  /// Subtracts the specified number of years from the date
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().subtractYears(1) // 1 year ago
  /// ```
  DateTime subtractYears(int years) {
    return addYears(-years);
  }

  /// Returns the start of the day (00:00:00)
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().startOfDay // Today at 00:00:00
  /// ```
  DateTime get startOfDay {
    return DateTime(year, month, day);
  }

  /// Returns the end of the day (23:59:59.999)
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().endOfDay // Today at 23:59:59.999
  /// ```
  DateTime get endOfDay {
    return DateTime(year, month, day, 23, 59, 59, 999);
  }

  /// Returns the start of the month
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().startOfMonth // First day of current month
  /// ```
  DateTime get startOfMonth {
    return DateTime(year, month, 1);
  }

  /// Returns the end of the month
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().endOfMonth // Last day of current month
  /// ```
  DateTime get endOfMonth {
    return DateTime(year, month + 1, 0, 23, 59, 59, 999);
  }

  /// Returns the number of days until the specified date
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().daysUntil(futureDate) // 5
  /// ```
  int daysUntil(DateTime other) {
    return other.difference(this).inDays;
  }

  /// Returns the number of days since the specified date
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().daysSince(pastDate) // 5
  /// ```
  int daysSince(DateTime other) {
    return difference(other).inDays;
  }

  /// Returns the number of hours until the specified date
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().hoursUntil(futureDate) // 24
  /// ```
  int hoursUntil(DateTime other) {
    return other.difference(this).inHours;
  }

  /// Returns the number of hours since the specified date
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().hoursSince(pastDate) // 24
  /// ```
  int hoursSince(DateTime other) {
    return difference(other).inHours;
  }

  /// Checks if the date is in the past
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().subtract(Duration(days: 1)).isPast // true
  /// ```
  bool get isPast {
    return isBefore(DateTime.now());
  }

  /// Checks if the date is in the future
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().add(Duration(days: 1)).isFuture // true
  /// ```
  bool get isFuture {
    return isAfter(DateTime.now());
  }

  /// Returns the age based on the date
  ///
  /// Example:
  /// ```dart
  /// DateTime(1990, 1, 1).age // 35 (if current year is 2025)
  /// ```
  int get age {
    final now = DateTime.now();
    int age = now.year - year;

    if (now.month < month || (now.month == month && now.day < day)) {
      age--;
    }

    return age;
  }

  /// Checks if the date is a weekend (Saturday or Sunday)
  ///
  /// Example:
  /// ```dart
  /// someDate.isWeekend // true or false
  /// ```
  bool get isWeekend {
    return weekday == DateTime.saturday || weekday == DateTime.sunday;
  }

  /// Checks if the date is a weekday (Monday to Friday)
  ///
  /// Example:
  /// ```dart
  /// someDate.isWeekday // true or false
  /// ```
  bool get isWeekday {
    return !isWeekend;
  }

  /// Returns the name of the day
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().dayName // 'Friday'
  /// ```
  String get dayName {
    return DateFormat('EEEE').format(this);
  }

  /// Returns the short name of the day
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().shortDayName // 'Fri'
  /// ```
  String get shortDayName {
    return DateFormat('EEE').format(this);
  }

  /// Returns the name of the month
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().monthName // 'November'
  /// ```
  String get monthName {
    return DateFormat('MMMM').format(this);
  }

  /// Returns the short name of the month
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().shortMonthName // 'Nov'
  /// ```
  String get shortMonthName {
    return DateFormat('MMM').format(this);
  }

  /// Copies the date with optional modifications
  ///
  /// Example:
  /// ```dart
  /// DateTime.now().copyWith(day: 15) // Same month/year but 15th day
  /// ```
  DateTime copyWith({
    int? year,
    int? month,
    int? day,
    int? hour,
    int? minute,
    int? second,
    int? millisecond,
    int? microsecond,
  }) {
    return DateTime(
      year ?? this.year,
      month ?? this.month,
      day ?? this.day,
      hour ?? this.hour,
      minute ?? this.minute,
      second ?? this.second,
      millisecond ?? this.millisecond,
      microsecond ?? this.microsecond,
    );
  }

  /// Checks if the date is the same day as another date
  ///
  /// Example:
  /// ```dart
  /// date1.isSameDay(date2) // true or false
  /// ```
  bool isSameDay(DateTime other) {
    return year == other.year && month == other.month && day == other.day;
  }

  /// Checks if the date is between two dates (inclusive)
  ///
  /// Example:
  /// ```dart
  /// date.isBetween(startDate, endDate) // true or false
  /// ```
  bool isBetween(DateTime start, DateTime end) {
    return (isAfter(start) || isAtSameMomentAs(start)) &&
        (isBefore(end) || isAtSameMomentAs(end));
  }
}

/// Nullable DateTime extension methods
extension NullableDateTimeExtensions on DateTime? {
  /// Returns the value or current date if null
  ///
  /// Example:
  /// ```dart
  /// DateTime? date = null;
  /// date.orNow() // DateTime.now()
  /// ```
  DateTime orNow() => this ?? DateTime.now();

  /// Returns the value or a default date if null
  ///
  /// Example:
  /// ```dart
  /// DateTime? date = null;
  /// date.orDefault(someDate) // someDate
  /// ```
  DateTime orDefault(DateTime defaultValue) => this ?? defaultValue;

  /// Checks if the value is null or in the past
  ///
  /// Example:
  /// ```dart
  /// DateTime? date = null;
  /// date.isNullOrPast // true
  /// ```
  bool get isNullOrPast => this == null || this!.isPast;

  /// Checks if the value is null or in the future
  ///
  /// Example:
  /// ```dart
  /// DateTime? date = null;
  /// date.isNullOrFuture // false
  /// ```
  bool get isNullOrFuture => this == null || this!.isFuture;
}
