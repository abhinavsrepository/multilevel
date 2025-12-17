package com.realestate.mlm.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;

/**
 * Utility class for date and time operations.
 */
@Slf4j
@Component
public class DateUtil {

    /**
     * Get the first day of the current month.
     *
     * @return First day of current month
     */
    public LocalDate getStartOfMonth() {
        try {
            LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
            log.debug("Start of month: {}", startOfMonth);
            return startOfMonth;
        } catch (Exception e) {
            log.error("Error getting start of month", e);
            return LocalDate.now();
        }
    }

    /**
     * Get the last day of the current month.
     *
     * @return Last day of current month
     */
    public LocalDate getEndOfMonth() {
        try {
            YearMonth yearMonth = YearMonth.now();
            LocalDate endOfMonth = yearMonth.atEndOfMonth();
            log.debug("End of month: {}", endOfMonth);
            return endOfMonth;
        } catch (Exception e) {
            log.error("Error getting end of month", e);
            return LocalDate.now();
        }
    }

    /**
     * Add months to a given date.
     *
     * @param date   The base date
     * @param months Number of months to add (can be negative)
     * @return New date with months added
     */
    public LocalDate addMonths(LocalDate date, int months) {
        try {
            if (date == null) {
                log.warn("Null date provided to addMonths, using current date");
                date = LocalDate.now();
            }

            LocalDate newDate = date.plusMonths(months);
            log.debug("Added {} months to {}: {}", months, date, newDate);
            return newDate;
        } catch (Exception e) {
            log.error("Error adding months to date", e);
            return date;
        }
    }

    /**
     * Calculate number of days between two dates.
     *
     * @param start The start date
     * @param end   The end date
     * @return Number of days between dates (positive if end is after start)
     */
    public long daysBetween(LocalDate start, LocalDate end) {
        try {
            if (start == null || end == null) {
                log.warn("Null dates provided to daysBetween");
                return 0;
            }

            long days = ChronoUnit.DAYS.between(start, end);
            log.debug("Days between {} and {}: {}", start, end, days);
            return days;
        } catch (Exception e) {
            log.error("Error calculating days between dates", e);
            return 0;
        }
    }

    /**
     * Check if a given date/time is today.
     *
     * @param dateTime The date/time to check
     * @return True if dateTime is today, false otherwise
     */
    public boolean isToday(LocalDateTime dateTime) {
        try {
            if (dateTime == null) {
                return false;
            }

            LocalDate today = LocalDate.now();
            LocalDate givenDate = dateTime.toLocalDate();
            boolean isToday = givenDate.equals(today);

            if (isToday) {
                log.debug("Date is today: {}", dateTime);
            }
            return isToday;
        } catch (Exception e) {
            log.error("Error checking if date is today", e);
            return false;
        }
    }

    /**
     * Check if a given date/time is in the current month.
     *
     * @param dateTime The date/time to check
     * @return True if dateTime is in current month, false otherwise
     */
    public boolean isThisMonth(LocalDateTime dateTime) {
        try {
            if (dateTime == null) {
                return false;
            }

            YearMonth currentMonth = YearMonth.now();
            YearMonth givenMonth = YearMonth.from(dateTime);
            boolean isThisMonth = currentMonth.equals(givenMonth);

            if (isThisMonth) {
                log.debug("Date is in current month: {}", dateTime);
            }
            return isThisMonth;
        } catch (Exception e) {
            log.error("Error checking if date is in current month", e);
            return false;
        }
    }

    /**
     * Get the start of a given month.
     *
     * @param date Any date in the month
     * @return First day of the month containing the given date
     */
    public LocalDate getStartOfMonth(LocalDate date) {
        try {
            if (date == null) {
                return getStartOfMonth();
            }
            return date.withDayOfMonth(1);
        } catch (Exception e) {
            log.error("Error getting start of month for date: {}", date, e);
            return date;
        }
    }

    /**
     * Get the end of a given month.
     *
     * @param date Any date in the month
     * @return Last day of the month containing the given date
     */
    public LocalDate getEndOfMonth(LocalDate date) {
        try {
            if (date == null) {
                return getEndOfMonth();
            }
            return YearMonth.from(date).atEndOfMonth();
        } catch (Exception e) {
            log.error("Error getting end of month for date: {}", date, e);
            return date;
        }
    }

    /**
     * Check if a date is in the past.
     *
     * @param date The date to check
     * @return True if date is in the past, false otherwise
     */
    public boolean isPast(LocalDate date) {
        try {
            if (date == null) {
                return false;
            }
            return date.isBefore(LocalDate.now());
        } catch (Exception e) {
            log.error("Error checking if date is in past", e);
            return false;
        }
    }

    /**
     * Check if a date is in the future.
     *
     * @param date The date to check
     * @return True if date is in the future, false otherwise
     */
    public boolean isFuture(LocalDate date) {
        try {
            if (date == null) {
                return false;
            }
            return date.isAfter(LocalDate.now());
        } catch (Exception e) {
            log.error("Error checking if date is in future", e);
            return false;
        }
    }
}
