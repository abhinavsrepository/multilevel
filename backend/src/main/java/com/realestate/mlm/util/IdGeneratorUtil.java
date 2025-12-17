package com.realestate.mlm.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;
import com.realestate.mlm.repository.UserSequenceRepository;

/**
 * Utility class for generating unique IDs for various entities in the system.
 */
@Slf4j
@Component
public class IdGeneratorUtil {

    @Autowired(required = false)
    private UserSequenceRepository userSequenceRepository;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Random RANDOM = new Random();
    private static final String USER_ID_PREFIX = "MLM";
    private static final String TRANSACTION_ID_PREFIX = "TXN";
    private static final String PAYOUT_ID_PREFIX = "PO";
    private static final String COMMISSION_ID_PREFIX = "COM";
    private static final String TICKET_ID_PREFIX = "TKT";
    private static final int OTP_LENGTH = 6;
    private static final int RANDOM_SUFFIX_LENGTH = 6;

    /**
     * Generate unique user ID - MLM001, MLM002, etc.
     *
     * @return Unique user ID in format MLM{sequence}
     */
    public String generateUserId() {
        try {
            long sequence = getNextUserSequence();
            String userId = String.format("%s%06d", USER_ID_PREFIX, sequence);
            log.debug("Generated user ID: {}", userId);
            return userId;
        } catch (Exception e) {
            log.error("Error generating user ID", e);
            return USER_ID_PREFIX + System.currentTimeMillis();
        }
    }

    /**
     * Generate transaction ID - TXN{timestamp}{random}.
     *
     * @return Unique transaction ID
     */
    public String generateTransactionId() {
        try {
            String timestamp = System.currentTimeMillis() + "";
            String random = generateRandomSuffix();
            String transactionId = TRANSACTION_ID_PREFIX + timestamp + random;
            log.debug("Generated transaction ID: {}", transactionId);
            return transactionId;
        } catch (Exception e) {
            log.error("Error generating transaction ID", e);
            return TRANSACTION_ID_PREFIX + System.currentTimeMillis();
        }
    }

    /**
     * Generate payout ID - PO{timestamp}{random}.
     *
     * @return Unique payout ID
     */
    public String generatePayoutId() {
        try {
            String timestamp = System.currentTimeMillis() + "";
            String random = generateRandomSuffix();
            String payoutId = PAYOUT_ID_PREFIX + timestamp + random;
            log.debug("Generated payout ID: {}", payoutId);
            return payoutId;
        } catch (Exception e) {
            log.error("Error generating payout ID", e);
            return PAYOUT_ID_PREFIX + System.currentTimeMillis();
        }
    }

    /**
     * Generate commission ID - COM{timestamp}{random}.
     *
     * @return Unique commission ID
     */
    public String generateCommissionId() {
        try {
            String timestamp = System.currentTimeMillis() + "";
            String random = generateRandomSuffix();
            String commissionId = COMMISSION_ID_PREFIX + timestamp + random;
            log.debug("Generated commission ID: {}", commissionId);
            return commissionId;
        } catch (Exception e) {
            log.error("Error generating commission ID", e);
            return COMMISSION_ID_PREFIX + System.currentTimeMillis();
        }
    }

    /**
     * Generate ticket ID - TKT{timestamp}{random}.
     *
     * @return Unique ticket ID
     */
    public String generateTicketId() {
        try {
            String timestamp = System.currentTimeMillis() + "";
            String random = generateRandomSuffix();
            String ticketId = TICKET_ID_PREFIX + timestamp + random;
            log.debug("Generated ticket ID: {}", ticketId);
            return ticketId;
        } catch (Exception e) {
            log.error("Error generating ticket ID", e);
            return TICKET_ID_PREFIX + System.currentTimeMillis();
        }
    }

    /**
     * Generate 6-digit OTP (One Time Password).
     *
     * @return 6-digit OTP
     */
    public String generateOtp() {
        try {
            int otp = SECURE_RANDOM.nextInt(1000000);
            String otpString = String.format("%0" + OTP_LENGTH + "d", otp);
            log.debug("Generated OTP");
            return otpString;
        } catch (Exception e) {
            log.error("Error generating OTP", e);
            return String.format("%06d", RANDOM.nextInt(1000000));
        }
    }

    /**
     * Get next user sequence number.
     *
     * @return Next sequence number
     */
    private long getNextUserSequence() {
        if (userSequenceRepository != null) {
            return userSequenceRepository.getNextSequence("user_id_sequence");
        }
        // Fallback if repository is not available
        return System.currentTimeMillis() % 1000000;
    }

    /**
     * Generate random suffix for IDs.
     *
     * @return Random suffix
     */
    private String generateRandomSuffix() {
        StringBuilder suffix = new StringBuilder();
        for (int i = 0; i < RANDOM_SUFFIX_LENGTH; i++) {
            suffix.append(RANDOM.nextInt(10));
        }
        return suffix.toString();
    }
}
