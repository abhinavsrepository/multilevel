package com.realestate.mlm.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

/**
 * Utility class for validating various formats like email, mobile, PAN, IFSC, etc.
 */
@Slf4j
@Component
public class ValidationUtil {

    // Regex patterns for validation
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$");

    private static final Pattern MOBILE_PATTERN = Pattern.compile(
            "^[6-9]\\d{9}$");

    private static final Pattern PAN_PATTERN = Pattern.compile(
            "^[A-Z]{5}[0-9]{4}[A-Z]{1}$");

    private static final Pattern IFSC_PATTERN = Pattern.compile(
            "^[A-Z]{4}0[A-Z0-9]{6}$");

    private static final Pattern PINCODE_PATTERN = Pattern.compile(
            "^[0-9]{6}$");

    private static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
    private static final Pattern STRONG_PASSWORD_PATTERN = Pattern.compile(PASSWORD_PATTERN);

    /**
     * Validate email format.
     *
     * @param email The email to validate
     * @return True if email is valid, false otherwise
     */
    public boolean isValidEmail(String email) {
        try {
            if (email == null || email.trim().isEmpty()) {
                log.debug("Email is null or empty");
                return false;
            }

            boolean isValid = EMAIL_PATTERN.matcher(email).matches();
            if (!isValid) {
                log.debug("Invalid email format: {}", email);
            }
            return isValid;
        } catch (Exception e) {
            log.error("Error validating email: {}", email, e);
            return false;
        }
    }

    /**
     * Validate mobile number - 10 digits starting with 6-9.
     *
     * @param mobile The mobile number to validate
     * @return True if mobile is valid, false otherwise
     */
    public boolean isValidMobile(String mobile) {
        try {
            if (mobile == null || mobile.trim().isEmpty()) {
                log.debug("Mobile is null or empty");
                return false;
            }

            // Remove any spaces or hyphens
            String cleanMobile = mobile.replaceAll("[\\s-]", "");

            boolean isValid = MOBILE_PATTERN.matcher(cleanMobile).matches();
            if (!isValid) {
                log.debug("Invalid mobile format: {}", mobile);
            }
            return isValid;
        } catch (Exception e) {
            log.error("Error validating mobile: {}", mobile, e);
            return false;
        }
    }

    /**
     * Validate PAN (Permanent Account Number) format.
     * Format: AAAAA9999A (5 letters, 4 digits, 1 letter)
     *
     * @param pan The PAN to validate
     * @return True if PAN is valid, false otherwise
     */
    public boolean isValidPan(String pan) {
        try {
            if (pan == null || pan.trim().isEmpty()) {
                log.debug("PAN is null or empty");
                return false;
            }

            String cleanPan = pan.toUpperCase().replaceAll("\\s", "");

            boolean isValid = PAN_PATTERN.matcher(cleanPan).matches();
            if (!isValid) {
                log.debug("Invalid PAN format: {}", pan);
            }
            return isValid;
        } catch (Exception e) {
            log.error("Error validating PAN: {}", pan, e);
            return false;
        }
    }

    /**
     * Validate IFSC (Indian Financial System Code) format.
     * Format: AAAA0AXXXXXX (4 letters, 0, 6 alphanumeric characters)
     *
     * @param ifsc The IFSC to validate
     * @return True if IFSC is valid, false otherwise
     */
    public boolean isValidIfsc(String ifsc) {
        try {
            if (ifsc == null || ifsc.trim().isEmpty()) {
                log.debug("IFSC is null or empty");
                return false;
            }

            String cleanIfsc = ifsc.toUpperCase().replaceAll("\\s", "");

            boolean isValid = IFSC_PATTERN.matcher(cleanIfsc).matches();
            if (!isValid) {
                log.debug("Invalid IFSC format: {}", ifsc);
            }
            return isValid;
        } catch (Exception e) {
            log.error("Error validating IFSC: {}", ifsc, e);
            return false;
        }
    }

    /**
     * Validate pincode - 6 digits.
     *
     * @param pincode The pincode to validate
     * @return True if pincode is valid, false otherwise
     */
    public boolean isValidPincode(String pincode) {
        try {
            if (pincode == null || pincode.trim().isEmpty()) {
                log.debug("Pincode is null or empty");
                return false;
            }

            String cleanPincode = pincode.replaceAll("\\s", "");

            boolean isValid = PINCODE_PATTERN.matcher(cleanPincode).matches();
            if (!isValid) {
                log.debug("Invalid pincode format: {}", pincode);
            }
            return isValid;
        } catch (Exception e) {
            log.error("Error validating pincode: {}", pincode, e);
            return false;
        }
    }

    /**
     * Validate password strength.
     * Requirements: Min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
     *
     * @param password The password to validate
     * @return True if password is strong, false otherwise
     */
    public boolean isStrongPassword(String password) {
        try {
            if (password == null || password.isEmpty()) {
                log.debug("Password is null or empty");
                return false;
            }

            // Check minimum length
            if (password.length() < 8) {
                log.debug("Password length is less than 8 characters");
                return false;
            }

            // Check for uppercase letter
            if (!password.matches(".*[A-Z].*")) {
                log.debug("Password missing uppercase letter");
                return false;
            }

            // Check for lowercase letter
            if (!password.matches(".*[a-z].*")) {
                log.debug("Password missing lowercase letter");
                return false;
            }

            // Check for digit
            if (!password.matches(".*\\d.*")) {
                log.debug("Password missing digit");
                return false;
            }

            // Check for special character
            if (!password.matches(".*[@$!%*?&].*")) {
                log.debug("Password missing special character");
                return false;
            }

            return true;
        } catch (Exception e) {
            log.error("Error validating password", e);
            return false;
        }
    }

    /**
     * Validate account number format.
     *
     * @param accountNumber The account number to validate
     * @return True if account number is valid, false otherwise
     */
    public boolean isValidAccountNumber(String accountNumber) {
        try {
            if (accountNumber == null || accountNumber.trim().isEmpty()) {
                log.debug("Account number is null or empty");
                return false;
            }

            String cleanAccountNumber = accountNumber.replaceAll("\\s", "");

            // Account number should be 9-18 digits
            if (!cleanAccountNumber.matches("^[0-9]{9,18}$")) {
                log.debug("Invalid account number format");
                return false;
            }

            return true;
        } catch (Exception e) {
            log.error("Error validating account number", e);
            return false;
        }
    }

    /**
     * Validate Aadhaar number format (12 digits).
     *
     * @param aadhaar The Aadhaar number to validate
     * @return True if Aadhaar is valid, false otherwise
     */
    public boolean isValidAadhaar(String aadhaar) {
        try {
            if (aadhaar == null || aadhaar.trim().isEmpty()) {
                log.debug("Aadhaar is null or empty");
                return false;
            }

            String cleanAadhaar = aadhaar.replaceAll("\\s", "");

            boolean isValid = cleanAadhaar.matches("^[0-9]{12}$");
            if (!isValid) {
                log.debug("Invalid Aadhaar format");
            }
            return isValid;
        } catch (Exception e) {
            log.error("Error validating Aadhaar", e);
            return false;
        }
    }

    /**
     * Check if string is not null and not empty.
     *
     * @param str The string to check
     * @return True if string is not null and not empty
     */
    public boolean isNotEmpty(String str) {
        return str != null && !str.trim().isEmpty();
    }

    /**
     * Check if a number is positive.
     *
     * @param number The number to check
     * @return True if number is positive, false otherwise
     */
    public boolean isPositiveNumber(double number) {
        return number > 0;
    }

    /**
     * Check if a number is within a range (inclusive).
     *
     * @param number The number to check
     * @param min    Minimum value (inclusive)
     * @param max    Maximum value (inclusive)
     * @return True if number is within range, false otherwise
     */
    public boolean isInRange(double number, double min, double max) {
        return number >= min && number <= max;
    }
}
