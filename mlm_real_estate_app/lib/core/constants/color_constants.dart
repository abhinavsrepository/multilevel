import 'package:flutter/material.dart';

/// Color Constants for MLM Real Estate Application
/// Contains all color definitions for light and dark themes

class AppColors {
  AppColors._();

  // Compatibility aliases for old property names
  static Color get primaryColor => primary;
  static Color get secondaryColor => secondary;
  static Color get backgroundColor => background;
  static Color get surfaceColor => surface;
  static Color get errorColor => error;
  static Color get inputFillColor => inputFill;
  static Color get borderColor => border;
  static Color get dividerColor => divider;
  static Color get chipBackgroundColor => surfaceVariant;
  static Color get darkBackgroundColor => darkBackground;
  static Color get darkSurfaceColor => darkSurface;
  static Color get darkInputFillColor => darkInputFill;
  static Color get darkBorderColor => darkBorder;

  // ============================================================================
  // PRIMARY COLORS
  // ============================================================================

  /// Primary brand color - Main app color
  static const Color primary = Color(0xFF1E3A8A);

  /// Primary variant - Darker shade of primary
  static const Color primaryDark = Color(0xFF0F2557);

  /// Primary light - Lighter shade of primary
  static const Color primaryLight = Color(0xFF3B52A5);

  /// Primary extra light - Very light shade for backgrounds
  static const Color primaryExtraLight = Color(0xFFE8EAF6);

  // ============================================================================
  // SECONDARY COLORS
  // ============================================================================

  /// Secondary brand color - Accent color
  static const Color secondary = Color(0xFFF59E0B);

  /// Secondary dark - Darker shade of secondary
  static const Color secondaryDark = Color(0xFFD97706);

  /// Secondary light - Lighter shade of secondary
  static const Color secondaryLight = Color(0xFFFBBF24);

  /// Secondary extra light - Very light shade for backgrounds
  static const Color secondaryExtraLight = Color(0xFFFEF3C7);

  // ============================================================================
  // TERTIARY COLORS
  // ============================================================================

  /// Tertiary color - Additional accent
  static const Color tertiary = Color(0xFF10B981);

  /// Tertiary dark
  static const Color tertiaryDark = Color(0xFF059669);

  /// Tertiary light
  static const Color tertiaryLight = Color(0xFF34D399);

  /// Tertiary extra light
  static const Color tertiaryExtraLight = Color(0xFFD1FAE5);

  // ============================================================================
  // SEMANTIC COLORS
  // ============================================================================

  /// Success color - For positive actions and states
  static const Color success = Color(0xFF10B981);

  /// Success dark
  static const Color successDark = Color(0xFF059669);

  /// Success light
  static const Color successLight = Color(0xFF34D399);

  /// Success background
  static const Color successBackground = Color(0xFFD1FAE5);

  /// Warning color - For caution states
  static const Color warning = Color(0xFFF59E0B);

  /// Warning dark
  static const Color warningDark = Color(0xFFD97706);

  /// Warning light
  static const Color warningLight = Color(0xFFFBBF24);

  /// Warning background
  static const Color warningBackground = Color(0xFFFEF3C7);

  /// Error color - For error states and destructive actions
  static const Color error = Color(0xFFEF4444);

  /// Error dark
  static const Color errorDark = Color(0xFFDC2626);

  /// Error light
  static const Color errorLight = Color(0xFFF87171);

  /// Error background
  static const Color errorBackground = Color(0xFFFEE2E2);

  /// Info color - For informational states
  static const Color info = Color(0xFF3B82F6);

  /// Info dark
  static const Color infoDark = Color(0xFF2563EB);

  /// Info light
  static const Color infoLight = Color(0xFF60A5FA);

  /// Info background
  static const Color infoBackground = Color(0xFFDBEAFE);

  // ============================================================================
  // NEUTRAL COLORS
  // ============================================================================

  /// White color
  static const Color white = Color(0xFFFFFFFF);

  /// Black color
  static const Color black = Color(0xFF000000);

  /// Transparent
  static const Color transparent = Color(0x00000000);

  // ============================================================================
  // BACKGROUND COLORS
  // ============================================================================

  /// Primary background color - Main app background
  static const Color background = Color(0xFFF9FAFB);

  /// Secondary background color
  static const Color backgroundSecondary = Color(0xFFFFFFFF);

  /// Surface color - For cards and elevated surfaces
  static const Color surface = Color(0xFFFFFFFF);

  /// Surface variant
  static const Color surfaceVariant = Color(0xFFF3F4F6);

  /// Scaffold background
  static const Color scaffold = Color(0xFFF9FAFB);

  // ============================================================================
  // TEXT COLORS
  // ============================================================================

  /// Primary text color - Main text
  static const Color textPrimary = Color(0xFF111827);

  /// Secondary text color - Less important text
  static const Color textSecondary = Color(0xFF6B7280);

  /// Tertiary text color - Least important text
  static const Color textTertiary = Color(0xFF9CA3AF);

  /// Hint text color - Placeholder text
  static const Color textHint = Color(0xFFD1D5DB);

  /// Disabled text color
  static const Color textDisabled = Color(0xFFE5E7EB);

  /// Text on primary color
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  /// Text on secondary color
  static const Color textOnSecondary = Color(0xFF111827);

  /// Text on surface
  static const Color textOnSurface = Color(0xFF111827);

  /// Text on background
  static const Color textOnBackground = Color(0xFF111827);

  // ============================================================================
  // BORDER COLORS
  // ============================================================================

  /// Primary border color
  static const Color border = Color(0xFFE5E7EB);

  /// Border light
  static const Color borderLight = Color(0xFFF3F4F6);

  /// Border dark
  static const Color borderDark = Color(0xFFD1D5DB);

  /// Border focus - For focused inputs
  static const Color borderFocus = Color(0xFF3B82F6);

  /// Border error - For error states
  static const Color borderError = Color(0xFFEF4444);

  /// Border success - For success states
  static const Color borderSuccess = Color(0xFF10B981);

  // ============================================================================
  // DIVIDER COLORS
  // ============================================================================

  /// Divider color
  static const Color divider = Color(0xFFE5E7EB);

  /// Divider light
  static const Color dividerLight = Color(0xFFF3F4F6);

  /// Divider dark
  static const Color dividerDark = Color(0xFFD1D5DB);

  // ============================================================================
  // INPUT COLORS
  // ============================================================================

  /// Input fill color
  static const Color inputFill = Color(0xFFF9FAFB);

  /// Input border color
  static const Color inputBorder = Color(0xFFE5E7EB);

  /// Input focus border color
  static const Color inputFocusBorder = Color(0xFF3B82F6);

  /// Input error border color
  static const Color inputErrorBorder = Color(0xFFEF4444);

  /// Input disabled fill
  static const Color inputDisabledFill = Color(0xFFF3F4F6);

  /// Input disabled border
  static const Color inputDisabledBorder = Color(0xFFE5E7EB);

  // ============================================================================
  // DARK MODE COLORS
  // ============================================================================

  /// Dark mode - Primary background
  static const Color darkBackground = Color(0xFF111827);

  /// Dark mode - Secondary background
  static const Color darkBackgroundSecondary = Color(0xFF1F2937);

  /// Dark mode - Surface
  static const Color darkSurface = Color(0xFF1F2937);

  /// Dark mode - Surface variant
  static const Color darkSurfaceVariant = Color(0xFF374151);

  /// Dark mode - Primary text
  static const Color darkTextPrimary = Color(0xFFF9FAFB);

  /// Dark mode - Secondary text
  static const Color darkTextSecondary = Color(0xFFD1D5DB);

  /// Dark mode - Tertiary text
  static const Color darkTextTertiary = Color(0xFF9CA3AF);

  /// Dark mode - Hint text
  static const Color darkTextHint = Color(0xFF6B7280);

  /// Dark mode - Border
  static const Color darkBorder = Color(0xFF374151);

  /// Dark mode - Divider
  static const Color darkDivider = Color(0xFF374151);

  /// Dark mode - Input fill
  static const Color darkInputFill = Color(0xFF1F2937);

  /// Dark mode - Input border
  static const Color darkInputBorder = Color(0xFF374151);

  // ============================================================================
  // STATUS COLORS
  // ============================================================================

  /// Active status color
  static const Color statusActive = Color(0xFF10B981);

  /// Inactive status color
  static const Color statusInactive = Color(0xFF6B7280);

  /// Pending status color
  static const Color statusPending = Color(0xFFF59E0B);

  /// Approved status color
  static const Color statusApproved = Color(0xFF10B981);

  /// Rejected status color
  static const Color statusRejected = Color(0xFFEF4444);

  /// Cancelled status color
  static const Color statusCancelled = Color(0xFF6B7280);

  /// Processing status color
  static const Color statusProcessing = Color(0xFF3B82F6);

  /// Completed status color
  static const Color statusCompleted = Color(0xFF10B981);

  /// On hold status color
  static const Color statusOnHold = Color(0xFFF59E0B);

  /// Expired status color
  static const Color statusExpired = Color(0xFFEF4444);

  // ============================================================================
  // INVESTMENT STATUS COLORS
  // ============================================================================

  /// Investment active color
  static const Color investmentActive = Color(0xFF10B981);

  /// Investment pending color
  static const Color investmentPending = Color(0xFFF59E0B);

  /// Investment completed color
  static const Color investmentCompleted = Color(0xFF3B82F6);

  /// Investment cancelled color
  static const Color investmentCancelled = Color(0xFFEF4444);

  /// Investment matured color
  static const Color investmentMatured = Color(0xFF8B5CF6);

  // ============================================================================
  // KYC STATUS COLORS
  // ============================================================================

  /// KYC not submitted color
  static const Color kycNotSubmitted = Color(0xFF6B7280);

  /// KYC pending color
  static const Color kycPending = Color(0xFFF59E0B);

  /// KYC verified color
  static const Color kycVerified = Color(0xFF10B981);

  /// KYC rejected color
  static const Color kycRejected = Color(0xFFEF4444);

  // ============================================================================
  // TRANSACTION TYPE COLORS
  // ============================================================================

  /// Credit transaction color
  static const Color transactionCredit = Color(0xFF10B981);

  /// Debit transaction color
  static const Color transactionDebit = Color(0xFFEF4444);

  // ============================================================================
  // RANK COLORS
  // ============================================================================

  /// Bronze rank color
  static const Color rankBronze = Color(0xFFCD7F32);

  /// Silver rank color
  static const Color rankSilver = Color(0xFFC0C0C0);

  /// Gold rank color
  static const Color rankGold = Color(0xFFFFD700);

  /// Platinum rank color
  static const Color rankPlatinum = Color(0xFFE5E4E2);

  /// Diamond rank color
  static const Color rankDiamond = Color(0xFFB9F2FF);

  /// Crown diamond rank color
  static const Color rankCrownDiamond = Color(0xFF4169E1);

  // ============================================================================
  // CHART COLORS
  // ============================================================================

  /// Chart color palette
  static const List<Color> chartColors = [
    Color(0xFF3B82F6),
    Color(0xFF10B981),
    Color(0xFFF59E0B),
    Color(0xFFEF4444),
    Color(0xFF8B5CF6),
    Color(0xFFEC4899),
    Color(0xFF06B6D4),
    Color(0xFF84CC16),
  ];

  /// Chart color 1
  static const Color chart1 = Color(0xFF3B82F6);

  /// Chart color 2
  static const Color chart2 = Color(0xFF10B981);

  /// Chart color 3
  static const Color chart3 = Color(0xFFF59E0B);

  /// Chart color 4
  static const Color chart4 = Color(0xFFEF4444);

  /// Chart color 5
  static const Color chart5 = Color(0xFF8B5CF6);

  /// Chart color 6
  static const Color chart6 = Color(0xFFEC4899);

  /// Chart color 7
  static const Color chart7 = Color(0xFF06B6D4);

  /// Chart color 8
  static const Color chart8 = Color(0xFF84CC16);

  // ============================================================================
  // GRADIENT COLORS
  // ============================================================================

  /// Primary gradient
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Secondary gradient
  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [secondary, secondaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Success gradient
  static const LinearGradient successGradient = LinearGradient(
    colors: [success, successLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Warning gradient
  static const LinearGradient warningGradient = LinearGradient(
    colors: [warning, warningLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Error gradient
  static const LinearGradient errorGradient = LinearGradient(
    colors: [error, errorLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ============================================================================
  // OVERLAY COLORS
  // ============================================================================

  /// Overlay dark
  static const Color overlayDark = Color(0x80000000);

  /// Overlay light
  static const Color overlayLight = Color(0x80FFFFFF);

  /// Modal barrier color
  static const Color modalBarrier = Color(0x80000000);

  /// Shimmer base color
  static const Color shimmerBase = Color(0xFFE0E0E0);

  /// Shimmer highlight color
  static const Color shimmerHighlight = Color(0xFFF5F5F5);

  // ============================================================================
  // SHADOW COLORS
  // ============================================================================

  /// Shadow color light
  static const Color shadowLight = Color(0x1A000000);

  /// Shadow color medium
  static const Color shadowMedium = Color(0x33000000);

  /// Shadow color dark
  static const Color shadowDark = Color(0x4D000000);

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /// Get status color by status name
  static Color getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return statusActive;
      case 'inactive':
        return statusInactive;
      case 'pending':
        return statusPending;
      case 'approved':
        return statusApproved;
      case 'rejected':
        return statusRejected;
      case 'cancelled':
        return statusCancelled;
      case 'processing':
        return statusProcessing;
      case 'completed':
        return statusCompleted;
      case 'on_hold':
      case 'onhold':
        return statusOnHold;
      case 'expired':
        return statusExpired;
      default:
        return textSecondary;
    }
  }

  /// Get investment status color
  static Color getInvestmentStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return investmentActive;
      case 'pending':
        return investmentPending;
      case 'completed':
        return investmentCompleted;
      case 'cancelled':
        return investmentCancelled;
      case 'matured':
        return investmentMatured;
      default:
        return textSecondary;
    }
  }

  /// Get KYC status color
  static Color getKycStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'not_submitted':
      case 'notsubmitted':
        return kycNotSubmitted;
      case 'pending':
        return kycPending;
      case 'verified':
      case 'approved':
        return kycVerified;
      case 'rejected':
        return kycRejected;
      default:
        return textSecondary;
    }
  }

  /// Get transaction type color
  static Color getTransactionTypeColor(String type) {
    switch (type.toLowerCase()) {
      case 'credit':
        return transactionCredit;
      case 'debit':
        return transactionDebit;
      default:
        return textSecondary;
    }
  }

  /// Get rank color by rank name
  static Color getRankColor(String rank) {
    switch (rank.toLowerCase()) {
      case 'bronze':
        return rankBronze;
      case 'silver':
        return rankSilver;
      case 'gold':
        return rankGold;
      case 'platinum':
        return rankPlatinum;
      case 'diamond':
        return rankDiamond;
      case 'crown_diamond':
      case 'crowndiamond':
        return rankCrownDiamond;
      default:
        return textSecondary;
    }
  }
}
