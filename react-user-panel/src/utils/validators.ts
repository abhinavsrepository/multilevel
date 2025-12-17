/**
 * Validation Functions
 * Contains validation functions for various input types
 */

import { VALIDATION_PATTERNS } from './constants';

/**
 * Validate email address
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  return VALIDATION_PATTERNS.EMAIL.test(email.trim());
};

/**
 * Get email validation error message
 */
export const getEmailError = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!validateEmail(email)) return 'Please enter a valid email address';
  return null;
};

/**
 * Validate mobile number (Indian format)
 */
export const validateMobile = (mobile: string): boolean => {
  if (!mobile) return false;
  const cleaned = mobile.replace(/\D/g, '');
  return VALIDATION_PATTERNS.MOBILE.test(cleaned);
};

/**
 * Get mobile validation error message
 */
export const getMobileError = (mobile: string): string | null => {
  if (!mobile) return 'Mobile number is required';
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length !== 10) return 'Mobile number must be 10 digits';
  if (!validateMobile(cleaned)) return 'Please enter a valid mobile number';
  return null;
};

/**
 * Validate PAN number (Indian format)
 */
export const validatePAN = (pan: string): boolean => {
  if (!pan) return false;
  return VALIDATION_PATTERNS.PAN.test(pan.toUpperCase());
};

/**
 * Get PAN validation error message
 */
export const getPANError = (pan: string): string | null => {
  if (!pan) return 'PAN is required';
  if (pan.length !== 10) return 'PAN must be 10 characters';
  if (!validatePAN(pan)) return 'Please enter a valid PAN (e.g., ABCDE1234F)';
  return null;
};

/**
 * Validate Aadhaar number (Indian format)
 */
export const validateAadhaar = (aadhaar: string): boolean => {
  if (!aadhaar) return false;
  const cleaned = aadhaar.replace(/\D/g, '');
  return VALIDATION_PATTERNS.AADHAAR.test(cleaned);
};

/**
 * Get Aadhaar validation error message
 */
export const getAadhaarError = (aadhaar: string): string | null => {
  if (!aadhaar) return 'Aadhaar is required';
  const cleaned = aadhaar.replace(/\D/g, '');
  if (cleaned.length !== 12) return 'Aadhaar must be 12 digits';
  if (!validateAadhaar(cleaned)) return 'Please enter a valid Aadhaar number';
  return null;
};

/**
 * Validate IFSC code (Indian format)
 */
export const validateIFSC = (ifsc: string): boolean => {
  if (!ifsc) return false;
  return VALIDATION_PATTERNS.IFSC.test(ifsc.toUpperCase());
};

/**
 * Get IFSC validation error message
 */
export const getIFSCError = (ifsc: string): string | null => {
  if (!ifsc) return 'IFSC code is required';
  if (ifsc.length !== 11) return 'IFSC code must be 11 characters';
  if (!validateIFSC(ifsc)) return 'Please enter a valid IFSC code (e.g., SBIN0001234)';
  return null;
};

/**
 * Validate pincode (Indian format)
 */
export const validatePincode = (pincode: string): boolean => {
  if (!pincode) return false;
  const cleaned = pincode.replace(/\D/g, '');
  return VALIDATION_PATTERNS.PINCODE.test(cleaned);
};

/**
 * Get pincode validation error message
 */
export const getPincodeError = (pincode: string): string | null => {
  if (!pincode) return 'Pincode is required';
  const cleaned = pincode.replace(/\D/g, '');
  if (cleaned.length !== 6) return 'Pincode must be 6 digits';
  if (!validatePincode(cleaned)) return 'Please enter a valid pincode';
  return null;
};

/**
 * Validate GST number (Indian format)
 */
export const validateGST = (gst: string): boolean => {
  if (!gst) return false;
  return VALIDATION_PATTERNS.GST.test(gst.toUpperCase());
};

/**
 * Get GST validation error message
 */
export const getGSTError = (gst: string): string | null => {
  if (!gst) return 'GST number is required';
  if (gst.length !== 15) return 'GST number must be 15 characters';
  if (!validateGST(gst)) return 'Please enter a valid GST number';
  return null;
};

/**
 * Validate bank account number
 */
export const validateAccountNumber = (accountNumber: string): boolean => {
  if (!accountNumber) return false;
  const cleaned = accountNumber.replace(/\D/g, '');
  return VALIDATION_PATTERNS.ACCOUNT_NUMBER.test(cleaned);
};

/**
 * Get account number validation error message
 */
export const getAccountNumberError = (accountNumber: string): string | null => {
  if (!accountNumber) return 'Account number is required';
  const cleaned = accountNumber.replace(/\D/g, '');
  if (cleaned.length < 9 || cleaned.length > 18) {
    return 'Account number must be between 9 and 18 digits';
  }
  if (!validateAccountNumber(cleaned)) return 'Please enter a valid account number';
  return null;
};

/**
 * Validate password
 */
export const validatePassword = (password: string): boolean => {
  if (!password) return false;
  return VALIDATION_PATTERNS.PASSWORD.test(password);
};

/**
 * Get password validation error message
 */
export const getPasswordError = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  if (!/[@$!%*?&]/.test(password)) return 'Password must contain at least one special character (@$!%*?&)';
  return null;
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Get password confirmation error message
 */
export const getPasswordConfirmationError = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Please confirm your password';
  if (!validatePasswordConfirmation(password, confirmPassword)) {
    return 'Passwords do not match';
  }
  return null;
};

/**
 * Validate URL
 */
export const validateURL = (url: string): boolean => {
  if (!url) return false;
  return VALIDATION_PATTERNS.URL.test(url);
};

/**
 * Get URL validation error message
 */
export const getURLError = (url: string): string | null => {
  if (!url) return 'URL is required';
  if (!validateURL(url)) return 'Please enter a valid URL';
  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Get required field error message
 */
export const getRequiredError = (fieldName: string): string => {
  return `${fieldName} is required`;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value: string, minLength: number): boolean => {
  if (!value) return false;
  return value.trim().length >= minLength;
};

/**
 * Get minimum length error message
 */
export const getMinLengthError = (fieldName: string, minLength: number): string => {
  return `${fieldName} must be at least ${minLength} characters`;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value: string, maxLength: number): boolean => {
  if (!value) return true;
  return value.trim().length <= maxLength;
};

/**
 * Get maximum length error message
 */
export const getMaxLengthError = (fieldName: string, maxLength: number): string => {
  return `${fieldName} must not exceed ${maxLength} characters`;
};

/**
 * Validate minimum value
 */
export const validateMinValue = (value: number, minValue: number): boolean => {
  return value >= minValue;
};

/**
 * Get minimum value error message
 */
export const getMinValueError = (fieldName: string, minValue: number): string => {
  return `${fieldName} must be at least ${minValue}`;
};

/**
 * Validate maximum value
 */
export const validateMaxValue = (value: number, maxValue: number): boolean => {
  return value <= maxValue;
};

/**
 * Get maximum value error message
 */
export const getMaxValueError = (fieldName: string, maxValue: number): string => {
  return `${fieldName} must not exceed ${maxValue}`;
};

/**
 * Validate numeric value
 */
export const validateNumeric = (value: string): boolean => {
  if (!value) return false;
  return VALIDATION_PATTERNS.NUMERIC.test(value);
};

/**
 * Get numeric validation error message
 */
export const getNumericError = (fieldName: string): string => {
  return `${fieldName} must be a number`;
};

/**
 * Validate alphabetic value
 */
export const validateAlphabetic = (value: string): boolean => {
  if (!value) return false;
  return VALIDATION_PATTERNS.ALPHABETIC.test(value);
};

/**
 * Get alphabetic validation error message
 */
export const getAlphabeticError = (fieldName: string): string => {
  return `${fieldName} must contain only letters`;
};

/**
 * Validate alphanumeric value
 */
export const validateAlphanumeric = (value: string): boolean => {
  if (!value) return false;
  return VALIDATION_PATTERNS.ALPHANUMERIC.test(value);
};

/**
 * Get alphanumeric validation error message
 */
export const getAlphanumericError = (fieldName: string): string => {
  return `${fieldName} must contain only letters and numbers`;
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

/**
 * Get file size error message
 */
export const getFileSizeError = (maxSize: number): string => {
  const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
  return `File size must not exceed ${maxSizeMB} MB`;
};

/**
 * Validate file type
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Get file type error message
 */
export const getFileTypeError = (allowedTypes: string[]): string => {
  const extensions = allowedTypes.map(type => {
    const parts = type.split('/');
    return parts[parts.length - 1].toUpperCase();
  }).join(', ');
  return `Only ${extensions} files are allowed`;
};

/**
 * Validate date (not in past)
 */
export const validateFutureDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return dateObj >= now;
};

/**
 * Get future date error message
 */
export const getFutureDateError = (fieldName: string): string => {
  return `${fieldName} must be a future date`;
};

/**
 * Validate date (not in future)
 */
export const validatePastDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return dateObj <= now;
};

/**
 * Get past date error message
 */
export const getPastDateError = (fieldName: string): string => {
  return `${fieldName} cannot be a future date`;
};

/**
 * Validate age (minimum)
 */
export const validateMinAge = (dob: Date | string, minAge: number): boolean => {
  const dateObj = typeof dob === 'string' ? new Date(dob) : dob;
  const today = new Date();
  const age = today.getFullYear() - dateObj.getFullYear();
  const monthDiff = today.getMonth() - dateObj.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
    return age - 1 >= minAge;
  }

  return age >= minAge;
};

/**
 * Get minimum age error message
 */
export const getMinAgeError = (minAge: number): string => {
  return `You must be at least ${minAge} years old`;
};

/**
 * Validate referral code
 */
export const validateReferralCode = (code: string): boolean => {
  if (!code) return false;
  // Referral code should be alphanumeric and 6-10 characters
  return /^[A-Z0-9]{6,10}$/.test(code.toUpperCase());
};

/**
 * Get referral code error message
 */
export const getReferralCodeError = (code: string): string | null => {
  if (!code) return null; // Referral code is usually optional
  if (!validateReferralCode(code)) {
    return 'Please enter a valid referral code (6-10 alphanumeric characters)';
  }
  return null;
};

/**
 * Validate amount
 */
export const validateAmount = (amount: number | string, min?: number, max?: number): boolean => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount) || numericAmount <= 0) {
    return false;
  }

  if (min !== undefined && numericAmount < min) {
    return false;
  }

  if (max !== undefined && numericAmount > max) {
    return false;
  }

  return true;
};

/**
 * Get amount validation error message
 */
export const getAmountError = (amount: number | string, min?: number, max?: number): string | null => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (!amount || amount === '') return 'Amount is required';
  if (isNaN(numericAmount)) return 'Please enter a valid amount';
  if (numericAmount <= 0) return 'Amount must be greater than 0';
  if (min !== undefined && numericAmount < min) return `Amount must be at least ${min}`;
  if (max !== undefined && numericAmount > max) return `Amount must not exceed ${max}`;

  return null;
};

/**
 * Validate OTP
 */
export const validateOTP = (otp: string, length = 6): boolean => {
  if (!otp) return false;
  const cleaned = otp.replace(/\D/g, '');
  return cleaned.length === length;
};

/**
 * Get OTP validation error message
 */
export const getOTPError = (otp: string, length = 6): string | null => {
  if (!otp) return 'OTP is required';
  const cleaned = otp.replace(/\D/g, '');
  if (cleaned.length !== length) return `OTP must be ${length} digits`;
  return null;
};

/**
 * Validate form data
 */
export interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateForm = (data: Record<string, any>, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = data[field];

    for (const rule of fieldRules) {
      if (!rule.validator(value)) {
        errors[field] = rule.message;
        break; // Stop at first error for this field
      }
    }
  });

  return errors;
};

/**
 * Check if form has errors
 */
export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Validate username
 */
export const validateUsername = (username: string): boolean => {
  if (!username) return false;
  // Username: 3-20 characters, alphanumeric, underscore, hyphen
  return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
};

/**
 * Get username validation error message
 */
export const getUsernameError = (username: string): string | null => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 20) return 'Username must not exceed 20 characters';
  if (!validateUsername(username)) {
    return 'Username can only contain letters, numbers, underscore and hyphen';
  }
  return null;
};

/**
 * Validate name (first name, last name)
 */
export const validateName = (name: string): boolean => {
  if (!name) return false;
  // Name: 2-50 characters, letters and spaces only
  return /^[a-zA-Z\s]{2,50}$/.test(name.trim());
};

/**
 * Get name validation error message
 */
export const getNameError = (fieldName: string, name: string): string | null => {
  if (!name) return `${fieldName} is required`;
  const trimmed = name.trim();
  if (trimmed.length < 2) return `${fieldName} must be at least 2 characters`;
  if (trimmed.length > 50) return `${fieldName} must not exceed 50 characters`;
  if (!validateName(trimmed)) return `${fieldName} can only contain letters and spaces`;
  return null;
};

/**
 * Validate address
 */
export const validateAddress = (address: string): boolean => {
  if (!address) return false;
  const trimmed = address.trim();
  return trimmed.length >= 10 && trimmed.length <= 200;
};

/**
 * Get address validation error message
 */
export const getAddressError = (address: string): string | null => {
  if (!address) return 'Address is required';
  const trimmed = address.trim();
  if (trimmed.length < 10) return 'Address must be at least 10 characters';
  if (trimmed.length > 200) return 'Address must not exceed 200 characters';
  return null;
};

/**
 * Sanitize input (remove HTML tags and special characters)
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
};

/**
 * Validate and sanitize input
 */
export const validateAndSanitize = (input: string, maxLength = 255): { isValid: boolean; sanitized: string; error?: string } => {
  const sanitized = sanitizeInput(input);

  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Input is required' };
  }

  if (sanitized.length > maxLength) {
    return { isValid: false, sanitized, error: `Input must not exceed ${maxLength} characters` };
  }

  return { isValid: true, sanitized };
};
