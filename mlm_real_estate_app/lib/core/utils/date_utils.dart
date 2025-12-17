/// Date and time utilities for formatting, parsing, and manipulation
library;

import 'package:intl/intl.dart';

class AppDateUtils {
  AppDateUtils._();

  // Common date formats
  static const String defaultDateFormat = 'dd MMM yyyy';
  static const String defaultTimeFormat = 'hh:mm a';
  static const String defaultDateTimeFormat = 'dd MMM yyyy, hh:mm a';
  static const String shortDateFormat = 'dd/MM/yyyy';
  static const String longDateFormat = 'EEEE, MMMM dd, yyyy';
  static const String monthYearFormat = 'MMMM yyyy';
  static const String yearFormat = 'yyyy';
  static const String timeOnlyFormat = 'HH:mm:ss';
  static const String iso8601Format = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

  /// Formats a DateTime to string with the given format
  /// Default format: 'dd MMM yyyy'
  static String formatDate(
    DateTime? date, {
    String format = defaultDateFormat,
  }) {
    if (date == null) return '';
    try {
      return DateFormat(format).format(date);
    } catch (e) {
      return '';
    }
  }

  /// Formats time only
  /// Default format: 'hh:mm a' (12-hour format)
  static String formatTime(
    DateTime? date, {
    String format = defaultTimeFormat,
  }) {
    if (date == null) return '';
    try {
      return DateFormat(format).format(date);
    } catch (e) {
      return '';
    }
  }

  /// Formats date and time
  /// Default format: 'dd MMM yyyy, hh:mm a'
  static String formatDateTime(
    DateTime? date, {
    String format = defaultDateTimeFormat,
  }) {
    if (date == null) return '';
    try {
      return DateFormat(format).format(date);
    } catch (e) {
      return '';
    }
  }

  /// Parses a date string to DateTime
  static DateTime? parseDate(String? dateString, {String? format}) {
    if (dateString == null || dateString.isEmpty) return null;

    try {
      if (format != null) {
        return DateFormat(format).parse(dateString);
      } else {
        // Try common formats
        return DateTime.parse(dateString);
      }
    } catch (e) {
      return null;
    }
  }

  /// Gets relative time string (e.g., "just now", "5 mins ago", "yesterday")
  static String getRelativeTime(DateTime? date) {
    if (date == null) return '';

    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inSeconds < 5) {
      return 'just now';
    } else if (difference.inSeconds < 60) {
      return '${difference.inSeconds} seconds ago';
    } else if (difference.inMinutes < 60) {
      final mins = difference.inMinutes;
      return '$mins ${mins == 1 ? 'minute' : 'minutes'} ago';
    } else if (difference.inHours < 24) {
      final hours = difference.inHours;
      return '$hours ${hours == 1 ? 'hour' : 'hours'} ago';
    } else if (difference.inDays < 7) {
      final days = difference.inDays;
      if (days == 1) return 'yesterday';
      return '$days days ago';
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

  /// Gets time ago string with custom format
  /// Returns formatted string like "2h ago", "5d ago", "3w ago"
  static String getTimeAgo(DateTime? date, {bool short = false}) {
    if (date == null) return '';

    final now = DateTime.now();
    final difference = now.difference(date);

    if (short) {
      if (difference.inSeconds < 60) return 'now';
      if (difference.inMinutes < 60) return '${difference.inMinutes}m';
      if (difference.inHours < 24) return '${difference.inHours}h';
      if (difference.inDays < 7) return '${difference.inDays}d';
      if (difference.inDays < 30) return '${(difference.inDays / 7).floor()}w';
      if (difference.inDays < 365) {
        return '${(difference.inDays / 30).floor()}mo';
      }
      return '${(difference.inDays / 365).floor()}y';
    }

    return getRelativeTime(date);
  }

  /// Gets the difference between two dates in days
  static int getDaysDifference(DateTime? date1, DateTime? date2) {
    if (date1 == null || date2 == null) return 0;
    return date1.difference(date2).inDays.abs();
  }

  /// Gets the difference between two dates in hours
  static int getHoursDifference(DateTime? date1, DateTime? date2) {
    if (date1 == null || date2 == null) return 0;
    return date1.difference(date2).inHours.abs();
  }

  /// Gets the difference between two dates in minutes
  static int getMinutesDifference(DateTime? date1, DateTime? date2) {
    if (date1 == null || date2 == null) return 0;
    return date1.difference(date2).inMinutes.abs();
  }

  /// Checks if the date is today
  static bool isToday(DateTime? date) {
    if (date == null) return false;
    final now = DateTime.now();
    return date.year == now.year &&
        date.month == now.month &&
        date.day == now.day;
  }

  /// Checks if the date is yesterday
  static bool isYesterday(DateTime? date) {
    if (date == null) return false;
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return date.year == yesterday.year &&
        date.month == yesterday.month &&
        date.day == yesterday.day;
  }

  /// Checks if the date is this week
  static bool isThisWeek(DateTime? date) {
    if (date == null) return false;
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
    final endOfWeek = startOfWeek.add(const Duration(days: 6));
    return date.isAfter(startOfWeek.subtract(const Duration(days: 1))) &&
        date.isBefore(endOfWeek.add(const Duration(days: 1)));
  }

  /// Checks if the date is this month
  static bool isThisMonth(DateTime? date) {
    if (date == null) return false;
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month;
  }

  /// Checks if the date is this year
  static bool isThisYear(DateTime? date) {
    if (date == null) return false;
    final now = DateTime.now();
    return date.year == now.year;
  }

  /// Gets the start of day (00:00:00)
  static DateTime getStartOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day);
  }

  /// Gets the end of day (23:59:59)
  static DateTime getEndOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day, 23, 59, 59, 999);
  }

  /// Gets the start of week (Monday 00:00:00)
  static DateTime getStartOfWeek(DateTime date) {
    final daysToSubtract = date.weekday - 1;
    final startOfWeek = date.subtract(Duration(days: daysToSubtract));
    return getStartOfDay(startOfWeek);
  }

  /// Gets the end of week (Sunday 23:59:59)
  static DateTime getEndOfWeek(DateTime date) {
    final daysToAdd = 7 - date.weekday;
    final endOfWeek = date.add(Duration(days: daysToAdd));
    return getEndOfDay(endOfWeek);
  }

  /// Gets the start of month (1st day 00:00:00)
  static DateTime getStartOfMonth(DateTime date) {
    return DateTime(date.year, date.month, 1);
  }

  /// Gets the end of month (last day 23:59:59)
  static DateTime getEndOfMonth(DateTime date) {
    final nextMonth = DateTime(date.year, date.month + 1, 1);
    final lastDay = nextMonth.subtract(const Duration(days: 1));
    return getEndOfDay(lastDay);
  }

  /// Gets the start of year (Jan 1st 00:00:00)
  static DateTime getStartOfYear(DateTime date) {
    return DateTime(date.year, 1, 1);
  }

  /// Gets the end of year (Dec 31st 23:59:59)
  static DateTime getEndOfYear(DateTime date) {
    return getEndOfDay(DateTime(date.year, 12, 31));
  }

  /// Adds days to a date
  static DateTime addDays(DateTime date, int days) {
    return date.add(Duration(days: days));
  }

  /// Subtracts days from a date
  static DateTime subtractDays(DateTime date, int days) {
    return date.subtract(Duration(days: days));
  }

  /// Adds months to a date
  static DateTime addMonths(DateTime date, int months) {
    int newMonth = date.month + months;
    int newYear = date.year;

    while (newMonth > 12) {
      newMonth -= 12;
      newYear++;
    }

    while (newMonth < 1) {
      newMonth += 12;
      newYear--;
    }

    // Handle day overflow (e.g., Jan 31 + 1 month = Feb 28/29)
    int newDay = date.day;
    final daysInNewMonth = DateTime(newYear, newMonth + 1, 0).day;
    if (newDay > daysInNewMonth) {
      newDay = daysInNewMonth;
    }

    return DateTime(
      newYear,
      newMonth,
      newDay,
      date.hour,
      date.minute,
      date.second,
      date.millisecond,
      date.microsecond,
    );
  }

  /// Subtracts months from a date
  static DateTime subtractMonths(DateTime date, int months) {
    return addMonths(date, -months);
  }

  /// Adds years to a date
  static DateTime addYears(DateTime date, int years) {
    return DateTime(
      date.year + years,
      date.month,
      date.day,
      date.hour,
      date.minute,
      date.second,
      date.millisecond,
      date.microsecond,
    );
  }

  /// Subtracts years from a date
  static DateTime subtractYears(DateTime date, int years) {
    return addYears(date, -years);
  }

  /// Gets age from date of birth
  static int getAge(DateTime dateOfBirth) {
    final today = DateTime.now();
    int age = today.year - dateOfBirth.year;

    if (today.month < dateOfBirth.month ||
        (today.month == dateOfBirth.month && today.day < dateOfBirth.day)) {
      age--;
    }

    return age;
  }

  /// Checks if a date is in the future
  static bool isFuture(DateTime date) {
    return date.isAfter(DateTime.now());
  }

  /// Checks if a date is in the past
  static bool isPast(DateTime date) {
    return date.isBefore(DateTime.now());
  }

  /// Gets the number of days in a month
  static int getDaysInMonth(int year, int month) {
    return DateTime(year, month + 1, 0).day;
  }

  /// Checks if a year is a leap year
  static bool isLeapYear(int year) {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
  }

  /// Formats duration to readable string
  static String formatDuration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    final seconds = duration.inSeconds.remainder(60);

    if (hours > 0) {
      return '${hours}h ${minutes}m ${seconds}s';
    } else if (minutes > 0) {
      return '${minutes}m ${seconds}s';
    } else {
      return '${seconds}s';
    }
  }

  /// Converts timestamp (milliseconds since epoch) to DateTime
  static DateTime? fromTimestamp(int? timestamp) {
    if (timestamp == null) return null;
    return DateTime.fromMillisecondsSinceEpoch(timestamp);
  }

  /// Converts DateTime to timestamp (milliseconds since epoch)
  static int? toTimestamp(DateTime? date) {
    return date?.millisecondsSinceEpoch;
  }
}
