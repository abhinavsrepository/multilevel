/// Validation utilities for form fields and user input
library;

class ValidationUtils {
  ValidationUtils._();

  /// Validates email address
  /// Returns null if valid, error message otherwise
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }

    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );

    if (!emailRegex.hasMatch(value)) {
      return 'Please enter a valid email address';
    }

    return null;
  }

  /// Validates mobile number with optional country code
  /// Supports Indian mobile numbers (+91, 91, or 10 digits)
  static String? validateMobile(String? value, {String countryCode = '+91'}) {
    if (value == null || value.isEmpty) {
      return 'Mobile number is required';
    }

    // Remove spaces and special characters
    final cleanedValue = value.replaceAll(RegExp(r'[\s\-\(\)]'), '');

    // Check for Indian mobile number
    if (countryCode == '+91' || countryCode == '91') {
      final mobileRegex = RegExp(r'^(\+91|91)?[6-9]\d{9}$');
      if (!mobileRegex.hasMatch(cleanedValue)) {
        return 'Please enter a valid 10-digit mobile number';
      }
    } else {
      // Generic validation for other countries (8-15 digits)
      final genericRegex = RegExp(r'^[\+]?[0-9]{8,15}$');
      if (!genericRegex.hasMatch(cleanedValue)) {
        return 'Please enter a valid mobile number';
      }
    }

    return null;
  }

  /// Validates password with comprehensive rules
  /// - Minimum length (default 8)
  /// - At least one uppercase letter
  /// - At least one lowercase letter
  /// - At least one number
  /// - At least one special character
  static String? validatePassword(
    String? value, {
    int minLength = 8,
    bool requireUppercase = true,
    bool requireLowercase = true,
    bool requireNumber = true,
    bool requireSpecialChar = true,
  }) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }

    if (value.length < minLength) {
      return 'Password must be at least $minLength characters long';
    }

    if (requireUppercase && !value.contains(RegExp(r'[A-Z]'))) {
      return 'Password must contain at least one uppercase letter';
    }

    if (requireLowercase && !value.contains(RegExp(r'[a-z]'))) {
      return 'Password must contain at least one lowercase letter';
    }

    if (requireNumber && !value.contains(RegExp(r'[0-9]'))) {
      return 'Password must contain at least one number';
    }

    if (requireSpecialChar &&
        !value.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) {
      return 'Password must contain at least one special character';
    }

    return null;
  }

  /// Validates username
  /// - Alphanumeric with optional underscore and dot
  /// - 3-20 characters
  /// - Cannot start or end with special characters
  static String? validateUsername(String? value) {
    if (value == null || value.isEmpty) {
      return 'Username is required';
    }

    if (value.length < 3) {
      return 'Username must be at least 3 characters long';
    }

    if (value.length > 20) {
      return 'Username must not exceed 20 characters';
    }

    final usernameRegex = RegExp(r'^[a-zA-Z0-9][a-zA-Z0-9._]*[a-zA-Z0-9]$');
    if (!usernameRegex.hasMatch(value)) {
      return 'Username can only contain letters, numbers, dots and underscores';
    }

    return null;
  }

  /// Validates name (first name, last name, full name)
  /// - Only letters and spaces
  /// - 2-50 characters
  static String? validateName(String? value, {String fieldName = 'Name'}) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }

    final trimmedValue = value.trim();

    if (trimmedValue.length < 2) {
      return '$fieldName must be at least 2 characters long';
    }

    if (trimmedValue.length > 50) {
      return '$fieldName must not exceed 50 characters';
    }

    final nameRegex = RegExp(r'^[a-zA-Z\s]+$');
    if (!nameRegex.hasMatch(trimmedValue)) {
      return '$fieldName can only contain letters and spaces';
    }

    return null;
  }

  /// Validates OTP (One Time Password)
  /// Default length is 6 digits
  static String? validateOTP(String? value, {int length = 6}) {
    if (value == null || value.isEmpty) {
      return 'OTP is required';
    }

    if (value.length != length) {
      return 'OTP must be $length digits';
    }

    final otpRegex = RegExp(r'^\d+$');
    if (!otpRegex.hasMatch(value)) {
      return 'OTP must contain only numbers';
    }

    return null;
  }

  /// Validates amount/money value
  /// - Must be a valid number
  /// - Optional min and max validation
  static String? validateAmount(
    String? value, {
    double? minAmount,
    double? maxAmount,
    String fieldName = 'Amount',
  }) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }

    final amount = double.tryParse(value);
    if (amount == null) {
      return 'Please enter a valid $fieldName';
    }

    if (amount <= 0) {
      return '$fieldName must be greater than zero';
    }

    if (minAmount != null && amount < minAmount) {
      return '$fieldName must be at least ₹$minAmount';
    }

    if (maxAmount != null && amount > maxAmount) {
      return '$fieldName must not exceed ₹$maxAmount';
    }

    return null;
  }

  /// Validates URL
  static String? validateURL(String? value) {
    if (value == null || value.isEmpty) {
      return 'URL is required';
    }

    final urlRegex = RegExp(
      r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$',
    );

    if (!urlRegex.hasMatch(value)) {
      return 'Please enter a valid URL';
    }

    return null;
  }

  /// Validates Indian PAN card number
  /// Format: ABCDE1234F (5 letters, 4 digits, 1 letter)
  static String? validatePAN(String? value) {
    if (value == null || value.isEmpty) {
      return 'PAN card number is required';
    }

    final panRegex = RegExp(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$');
    if (!panRegex.hasMatch(value.toUpperCase())) {
      return 'Please enter a valid PAN card number';
    }

    return null;
  }

  /// Validates Indian Aadhaar number
  /// 12 digits with optional spaces
  static String? validateAadhaar(String? value) {
    if (value == null || value.isEmpty) {
      return 'Aadhaar number is required';
    }

    // Remove spaces
    final cleanedValue = value.replaceAll(RegExp(r'\s'), '');

    if (cleanedValue.length != 12) {
      return 'Aadhaar number must be 12 digits';
    }

    final aadhaarRegex = RegExp(r'^\d{12}$');
    if (!aadhaarRegex.hasMatch(cleanedValue)) {
      return 'Please enter a valid Aadhaar number';
    }

    // Check if all digits are same (invalid Aadhaar)
    if (RegExp(r'^(\d)\1{11}$').hasMatch(cleanedValue)) {
      return 'Please enter a valid Aadhaar number';
    }

    return null;
  }

  /// Validates Indian IFSC code
  /// Format: 4 letters (bank code) + 0 + 6 alphanumeric characters (branch code)
  static String? validateIFSC(String? value) {
    if (value == null || value.isEmpty) {
      return 'IFSC code is required';
    }

    if (value.length != 11) {
      return 'IFSC code must be 11 characters';
    }

    final ifscRegex = RegExp(r'^[A-Z]{4}0[A-Z0-9]{6}$');
    if (!ifscRegex.hasMatch(value.toUpperCase())) {
      return 'Please enter a valid IFSC code';
    }

    return null;
  }

  /// Validates bank account number
  /// 9-18 digits (Indian bank accounts)
  static String? validateAccountNumber(String? value) {
    if (value == null || value.isEmpty) {
      return 'Account number is required';
    }

    // Remove spaces
    final cleanedValue = value.replaceAll(RegExp(r'\s'), '');

    if (cleanedValue.length < 9 || cleanedValue.length > 18) {
      return 'Account number must be between 9 and 18 digits';
    }

    final accountRegex = RegExp(r'^\d{9,18}$');
    if (!accountRegex.hasMatch(cleanedValue)) {
      return 'Please enter a valid account number';
    }

    return null;
  }

  /// Validates confirm password matches original password
  static String? validateConfirmPassword(String? value, String? password) {
    if (value == null || value.isEmpty) {
      return 'Please confirm your password';
    }

    if (value != password) {
      return 'Passwords do not match';
    }

    return null;
  }

  /// Generic required field validator
  static String? validateRequired(String? value, {String fieldName = 'Field'}) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }
    return null;
  }

  /// Validates minimum length
  static String? validateMinLength(
    String? value,
    int minLength, {
    String fieldName = 'Field',
  }) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }

    if (value.length < minLength) {
      return '$fieldName must be at least $minLength characters';
    }

    return null;
  }

  /// Validates maximum length
  static String? validateMaxLength(
    String? value,
    int maxLength, {
    String fieldName = 'Field',
  }) {
    if (value != null && value.length > maxLength) {
      return '$fieldName must not exceed $maxLength characters';
    }

    return null;
  }

  /// Validates numeric value
  static String? validateNumeric(String? value, {String fieldName = 'Field'}) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }

    if (double.tryParse(value) == null) {
      return '$fieldName must be a valid number';
    }

    return null;
  }

  /// Validates alphanumeric value
  static String? validateAlphanumeric(
    String? value, {
    String fieldName = 'Field',
  }) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }

    final alphanumericRegex = RegExp(r'^[a-zA-Z0-9]+$');
    if (!alphanumericRegex.hasMatch(value)) {
      return '$fieldName must contain only letters and numbers';
    }

    return null;
  }
}
