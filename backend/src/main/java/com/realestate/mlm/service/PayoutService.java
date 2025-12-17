package com.realestate.mlm.service;

import com.realestate.mlm.dto.request.WithdrawalRequest;
import com.realestate.mlm.dto.response.PageResponse;
import com.realestate.mlm.dto.response.PayoutResponse;
import com.realestate.mlm.exception.BadRequestException;
import com.realestate.mlm.exception.InsufficientBalanceException;
import com.realestate.mlm.exception.ResourceNotFoundException;
import com.realestate.mlm.exception.UnauthorizedException;
import com.realestate.mlm.model.BankAccount;
import com.realestate.mlm.model.Payout;
import com.realestate.mlm.model.User;
import com.realestate.mlm.model.Wallet;
import com.realestate.mlm.repository.BankAccountRepository;
import com.realestate.mlm.repository.PayoutRepository;
import com.realestate.mlm.repository.UserRepository;
import com.realestate.mlm.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayoutService {

    private final PayoutRepository payoutRepository;
    private final UserRepository userRepository;
    private final BankAccountRepository bankAccountRepository;
    private final WalletService walletService;
    private final NotificationService notificationService;

    private static final BigDecimal MINIMUM_WITHDRAWAL = new BigDecimal("1000.00");
    private static final BigDecimal TDS_PERCENTAGE = new BigDecimal("10.00");
    private static final BigDecimal ADMIN_CHARGE_PERCENTAGE = new BigDecimal("2.00");

    /**
     * Request withdrawal/payout for current authenticated user
     */
    @Transactional
    public PayoutResponse requestWithdrawal(WithdrawalRequest request) {
        String currentUserMlmId = SecurityUtil.getCurrentUserMlmId();
        log.info("Processing withdrawal request for current user: {}", currentUserMlmId);
        return requestWithdrawal(request, currentUserMlmId);
    }

    /**
     * Request withdrawal/payout
     */
    @Transactional
    public PayoutResponse requestWithdrawal(WithdrawalRequest request, String userId) {
        log.info("Processing withdrawal request for user: {}, amount: {}", userId, request.getAmount());

        // Find user
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Validate minimum withdrawal
        if (request.getAmount().compareTo(MINIMUM_WITHDRAWAL) < 0) {
            throw new BadRequestException(String.format(
                    "Minimum withdrawal amount is Rs %s",
                    MINIMUM_WITHDRAWAL));
        }

        // Get wallet and validate withdrawable balance
        Wallet wallet = walletService.getWalletByUser(user);
        BigDecimal withdrawableBalance = wallet.getWithdrawableBalance();

        if (withdrawableBalance.compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(String.format(
                    "Insufficient withdrawable balance. Available: Rs %s, Requested: Rs %s",
                    withdrawableBalance,
                    request.getAmount()));
        }

        // Calculate TDS (10%)
        BigDecimal tdsAmount = request.getAmount()
                .multiply(TDS_PERCENTAGE)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        // Calculate admin charge (2%)
        BigDecimal adminCharge = request.getAmount()
                .multiply(ADMIN_CHARGE_PERCENTAGE)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        // Calculate net amount
        BigDecimal netAmount = request.getAmount()
                .subtract(tdsAmount)
                .subtract(adminCharge);

        // Create payout record
        Payout payout = new Payout();
        payout.setPayoutId(generatePayoutId());
        payout.setUser(user);
        payout.setRequestedAmount(request.getAmount());
        payout.setTdsAmount(tdsAmount);
        payout.setAdminCharge(adminCharge);
        payout.setNetAmount(netAmount);
        payout.setPaymentMethod(request.getPaymentMethod());
        payout.setStatus("REQUESTED");
        payout.setRequestedAt(LocalDateTime.now());

        // Set payment details based on method
        if ("BANK_TRANSFER".equals(request.getPaymentMethod())) {
            // Get bank account
            if (request.getBankAccountId() != null) {
                BankAccount bankAccount = bankAccountRepository.findById(Long.parseLong(request.getBankAccountId()))
                        .orElseThrow(() -> new ResourceNotFoundException("Bank account not found"));

                payout.setBankName(bankAccount.getBankName());
                payout.setAccountNumber(bankAccount.getAccountNumber());
                payout.setIfscCode(bankAccount.getIfscCode());
                payout.setAccountHolderName(bankAccount.getAccountHolderName());
                payout.setBranchName(bankAccount.getBranchName());
            } else {
                // Get primary bank account
                BankAccount primaryAccount = bankAccountRepository.findByUserAndIsPrimaryTrue(user)
                        .orElseThrow(() -> new BadRequestException(
                                "No primary bank account found. Please add a bank account."));

                payout.setBankName(primaryAccount.getBankName());
                payout.setAccountNumber(primaryAccount.getAccountNumber());
                payout.setIfscCode(primaryAccount.getIfscCode());
                payout.setAccountHolderName(primaryAccount.getAccountHolderName());
                payout.setBranchName(primaryAccount.getBranchName());
            }
        } else if ("UPI".equals(request.getPaymentMethod())) {
            if (request.getUpiId() == null || request.getUpiId().isEmpty()) {
                throw new BadRequestException("UPI ID is required for UPI payment");
            }
            payout.setUpiId(request.getUpiId());
        }

        // Lock the balance
        walletService.lockBalance(user, request.getAmount());

        Payout savedPayout = payoutRepository.save(payout);

        // Send notification
        notificationService.sendPayoutRequestNotification(
                user.getEmail(),
                user.getFullName(),
                request.getAmount(),
                netAmount);

        log.info("Withdrawal request created: {}, net amount: {}", savedPayout.getPayoutId(), netAmount);

        return mapToResponse(savedPayout);
    }

    /**
     * Get pending payouts (Admin)
     */
    public Page<PayoutResponse> getPendingPayouts(Pageable pageable) {
        log.info("Fetching pending payouts");

        List<String> pendingStatuses = Arrays.asList("REQUESTED", "APPROVED");
        Page<Payout> payouts = payoutRepository.findAll(
                (root, query, criteriaBuilder) -> criteriaBuilder.or(
                        criteriaBuilder.equal(root.get("status"), "REQUESTED"),
                        criteriaBuilder.equal(root.get("status"), "APPROVED")),
                pageable);

        return payouts.map(this::mapToResponse);
    }

    /**
     * Get payout history for user
     */
    public Page<PayoutResponse> getPayoutHistory(String userId, Pageable pageable) {
        log.info("Fetching payout history for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Page<Payout> payouts = payoutRepository.findByUser(user, pageable);

        return payouts.map(this::mapToResponse);
    }

    /**
     * Get payout history for current authenticated user
     */
    public PageResponse<PayoutResponse> getPayoutHistory(Pageable pageable) {
        String currentUserMlmId = SecurityUtil.getCurrentUserMlmId();
        log.info("Fetching payout history for current user: {}", currentUserMlmId);

        User user = userRepository.findByUserId(currentUserMlmId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + currentUserMlmId));

        Page<Payout> payouts = payoutRepository.findByUser(user, pageable);
        Page<PayoutResponse> responsePage = payouts.map(this::mapToResponse);

        return PageResponse.<PayoutResponse>builder()
                .content(responsePage.getContent())
                .page(responsePage.getNumber())
                .size(responsePage.getSize())
                .totalElements(responsePage.getTotalElements())
                .totalPages(responsePage.getTotalPages())
                .last(responsePage.isLast())
                .build();
    }

    /**
     * Get payout details for a specific payout
     * Validates that the payout belongs to the current user (non-admin users)
     */
    public PayoutResponse getPayoutDetails(String payoutId) {
        log.info("Fetching payout details for payoutId: {}", payoutId);

        Payout payout = payoutRepository.findByPayoutId(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout not found with ID: " + payoutId));

        // Validate that the payout belongs to the current user (unless admin)
        User currentUser = SecurityUtil.getCurrentUser();
        if (!SecurityUtil.isAdmin() && !payout.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to view this payout");
        }

        return mapToResponse(payout);
    }

    /**
     * Approve payout (Admin)
     */
    @Transactional
    public PayoutResponse approvePayout(String payoutId, Long adminId) {
        log.info("Approving payout: {} by admin: {}", payoutId, adminId);

        Payout payout = payoutRepository.findByPayoutId(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout not found with ID: " + payoutId));

        // Validate status
        if (!"REQUESTED".equals(payout.getStatus())) {
            throw new BadRequestException("Only REQUESTED payouts can be approved");
        }

        // Update status
        payout.setStatus("APPROVED");
        payout.setApprovedAt(LocalDateTime.now());
        payout.setApprovedBy("ADMIN_" + adminId);

        Payout updatedPayout = payoutRepository.save(payout);

        // Send notification
        notificationService.sendPayoutApprovedNotification(
                payout.getUser().getEmail(),
                payout.getUser().getFullName(),
                payout.getNetAmount());

        log.info("Payout approved: {}", payoutId);

        return mapToResponse(updatedPayout);
    }

    /**
     * Reject payout (Admin)
     */
    @Transactional
    public PayoutResponse rejectPayout(String payoutId, Long adminId, String reason) {
        log.info("Rejecting payout: {} by admin: {}, reason: {}", payoutId, adminId, reason);

        Payout payout = payoutRepository.findByPayoutId(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout not found with ID: " + payoutId));

        // Validate status
        if (!"REQUESTED".equals(payout.getStatus()) && !"APPROVED".equals(payout.getStatus())) {
            throw new BadRequestException("Only REQUESTED or APPROVED payouts can be rejected");
        }

        // Unlock the balance
        walletService.unlockBalance(payout.getUser(), payout.getRequestedAmount());

        // Update status
        payout.setStatus("REJECTED");
        payout.setRejectionReason(reason);

        Payout updatedPayout = payoutRepository.save(payout);

        // Send notification
        notificationService.sendPayoutRejectedNotification(
                payout.getUser().getEmail(),
                payout.getUser().getFullName(),
                payout.getRequestedAmount(),
                reason);

        log.info("Payout rejected: {}", payoutId);

        return mapToResponse(updatedPayout);
    }

    /**
     * Process all approved payouts (Scheduled Job)
     */
    @Transactional
    public int processApprovedPayouts() {
        log.info("Starting processing of all approved payouts");

        List<Payout> approvedPayouts = payoutRepository.findByStatus("APPROVED");
        int processedCount = 0;

        for (Payout payout : approvedPayouts) {
            try {
                processRazorpayPayout(payout);
                processedCount++;
            } catch (Exception e) {
                log.error("Failed to process payout during scheduled job: {}", payout.getPayoutId(), e);
                // We continue processing other payouts even if one fails
            }
        }

        log.info("Completed processing of approved payouts. Processed: {}/{}", processedCount, approvedPayouts.size());
        return processedCount;
    }

    /**
     * Process payout via Razorpay (Admin)
     */
    @Transactional
    public PayoutResponse processRazorpayPayout(Payout payout) {
        log.info("Processing Razorpay payout: {}", payout.getPayoutId());

        // Validate status
        if (!"APPROVED".equals(payout.getStatus())) {
            throw new BadRequestException("Only APPROVED payouts can be processed");
        }

        try {
            // TODO: Integrate with Razorpay Payout API
            // For now, we'll simulate the payout

            // Simulate API call
            String razorpayPayoutId = "rzp_payout_" + UUID.randomUUID().toString().substring(0, 16);
            String utrNumber = "UTR" + System.currentTimeMillis();

            // Update payout status
            payout.setStatus("PROCESSED");
            payout.setProcessedAt(LocalDateTime.now());
            payout.setPaymentGatewayRef(razorpayPayoutId);
            payout.setUtrNumber(utrNumber);

            // Deduct from wallet (unlock and deduct)
            walletService.unlockBalance(payout.getUser(), payout.getRequestedAmount());
            walletService.debitWallet(
                    payout.getUser(),
                    payout.getRequestedAmount(),
                    "COMMISSION",
                    "Withdrawal processed - " + payout.getPayoutId());

            payout.setStatus("COMPLETED");
            payout.setCompletedAt(LocalDateTime.now());

            Payout completedPayout = payoutRepository.save(payout);

            // Send notification
            notificationService.sendPayoutCompletedNotification(
                    payout.getUser().getEmail(),
                    payout.getUser().getFullName(),
                    payout.getNetAmount(),
                    utrNumber);

            log.info("Razorpay payout processed successfully: {}", payout.getPayoutId());

            return mapToResponse(completedPayout);

        } catch (Exception e) {
            log.error("Failed to process Razorpay payout: {}", payout.getPayoutId(), e);

            payout.setStatus("FAILED");
            payout.setRejectionReason("Payment gateway error: " + e.getMessage());
            payoutRepository.save(payout);

            throw new RuntimeException("Failed to process payout: " + e.getMessage());
        }
    }

    /**
     * Batch process payouts (Admin)
     */
    @Transactional
    public List<PayoutResponse> batchProcessPayouts(List<Long> payoutIds) {
        log.info("Batch processing {} payouts", payoutIds.size());

        List<Payout> payouts = payoutRepository.findAllById(payoutIds);
        List<PayoutResponse> responses = new ArrayList<>();

        for (Payout payout : payouts) {
            try {
                PayoutResponse response = processRazorpayPayout(payout);
                responses.add(response);
            } catch (Exception e) {
                log.error("Failed to process payout in batch: {}", payout.getPayoutId(), e);
            }
        }

        log.info("Batch processing completed. Processed: {}/{}", responses.size(), payoutIds.size());

        return responses;
    }

    /**
     * Retry failed payout
     */
    @Transactional
    public PayoutResponse retryFailedPayout(Long payoutId) {
        log.info("Retrying failed payout ID: {}", payoutId);

        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout not found with ID: " + payoutId));

        // Validate status
        if (!"FAILED".equals(payout.getStatus())) {
            throw new BadRequestException("Only FAILED payouts can be retried");
        }

        // Reset status to approved for retry
        payout.setStatus("APPROVED");
        payout.setRejectionReason(null);
        payoutRepository.save(payout);

        // Process again
        return processRazorpayPayout(payout);
    }

    /**
     * Generate unique payout ID
     */
    private String generatePayoutId() {
        return "PAYOUT" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Map Payout to PayoutResponse
     */
    private PayoutResponse mapToResponse(Payout payout) {
        return PayoutResponse.builder()
                .payoutId(payout.getPayoutId())
                .userId(payout.getUser().getUserId())
                .userName(payout.getUser().getFullName())
                .requestedAmount(payout.getRequestedAmount())
                .tdsAmount(payout.getTdsAmount())
                .adminCharge(payout.getAdminCharge())
                .netAmount(payout.getNetAmount())
                .paymentMethod(payout.getPaymentMethod())
                .bankName(payout.getBankName())
                .accountNumber(payout.getAccountNumber())
                .ifscCode(payout.getIfscCode())
                .upiId(payout.getUpiId())
                .status(payout.getStatus())
                .rejectionReason(payout.getRejectionReason())
                .utrNumber(payout.getUtrNumber())
                .requestedAt(payout.getRequestedAt())
                .approvedAt(payout.getApprovedAt())
                .processedAt(payout.getProcessedAt())
                .completedAt(payout.getCompletedAt())
                .build();
    }
}
