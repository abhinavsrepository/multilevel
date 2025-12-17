package com.realestate.mlm.service;

import com.realestate.mlm.dto.response.*;
import com.realestate.mlm.exception.BadRequestException;
import com.realestate.mlm.exception.ResourceNotFoundException;
import com.realestate.mlm.model.*;
import com.realestate.mlm.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

        private final UserRepository userRepository;
        private final PayoutRepository payoutRepository;
        private final KycDocumentRepository kycDocumentRepository;
        private final PropertyRepository propertyRepository;
        private final PropertyInvestmentRepository propertyInvestmentRepository;
        private final CommissionRepository commissionRepository;
        private final WalletRepository walletRepository;
        private final SupportTicketRepository supportTicketRepository;
        private final NotificationService notificationService;

        /**
         * Get all users with pagination
         */
        public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
                log.info("Fetching all users with pagination");

                Page<User> userPage = userRepository.findAll(pageable);

                return PageResponse.<UserResponse>builder()
                                .content(userPage.getContent().stream()
                                                .map(this::mapToUserResponse)
                                                .collect(Collectors.toList()))
                                .page(userPage.getNumber())
                                .size(userPage.getSize())
                                .totalElements(userPage.getTotalElements())
                                .totalPages(userPage.getTotalPages())
                                .last(userPage.isLast())
                                .build();
        }

        /**
         * Activate user account
         */
        @Transactional
        public String activateUser(Long userId) {
                log.info("Activating user with ID: {}", userId);

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

                user.setStatus("ACTIVE");
                userRepository.save(user);

                // Send notification to user
                notificationService.sendNotification(
                                user.getId(),
                                "Account Activated",
                                "Your account has been activated successfully.",
                                "ACCOUNT");

                log.info("User {} activated successfully", user.getUserId());
                return "User activated successfully";
        }

        /**
         * Block user account
         */
        @Transactional
        public String blockUser(Long userId) {
                log.info("Blocking user with ID: {}", userId);

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

                user.setStatus("BLOCKED");
                userRepository.save(user);

                // Send notification to user
                notificationService.sendNotification(
                                user.getId(),
                                "Account Blocked",
                                "Your account has been blocked. Please contact support for more information.",
                                "ACCOUNT");

                log.info("User {} blocked successfully", user.getUserId());
                return "User blocked successfully";
        }

        /**
         * Get admin dashboard statistics
         */
        public AdminDashboardResponse getAdminDashboard() {
                log.info("Fetching admin dashboard statistics");

                LocalDateTime today = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
                LocalDateTime thisMonthStart = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIN);

                // User statistics
                Long totalUsers = userRepository.count();
                Long activeUsers = userRepository.countByStatus("ACTIVE");
                Long inactiveUsers = totalUsers - activeUsers;
                Long newUsersToday = userRepository.countByCreatedAtGreaterThanEqual(today);
                Long newUsersThisMonth = userRepository.countByCreatedAtGreaterThanEqual(thisMonthStart);

                // Investment statistics
                BigDecimal totalInvestments = propertyInvestmentRepository.findAll().stream()
                                .map(PropertyInvestment::getInvestmentAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalInvestmentsThisMonth = propertyInvestmentRepository
                                .findByCreatedAtGreaterThanEqual(thisMonthStart).stream()
                                .map(PropertyInvestment::getInvestmentAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Commission statistics
                BigDecimal totalCommissionsPaid = commissionRepository.findByStatus("PAID").stream()
                                .map(Commission::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalCommissionsThisMonth = commissionRepository
                                .findByStatusAndCreatedAtGreaterThanEqual("PAID", thisMonthStart).stream()
                                .map(Commission::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Property statistics
                Long totalProperties = propertyRepository.count();
                Long activeProperties = propertyRepository.countByStatus("ACTIVE");

                // Payout statistics
                Long pendingPayouts = payoutRepository.countByStatus("PENDING");
                BigDecimal pendingPayoutAmount = payoutRepository.findByStatus("PENDING").stream()
                                .map(Payout::getRequestedAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // KYC statistics
                Long pendingKycDocuments = kycDocumentRepository.countByStatus("PENDING");

                // Support ticket statistics
                Long pendingSupportTickets = supportTicketRepository.countByStatus("OPEN") +
                                supportTicketRepository.countByStatus("IN_PROGRESS");

                // Wallet balance
                BigDecimal totalWalletBalance = walletRepository.findAll().stream()
                                .map(w -> w.getCommissionBalance()
                                                .add(w.getInvestmentBalance())
                                                .add(w.getRentalIncomeBalance())
                                                .add(w.getRoiBalance()))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Platform revenue (example calculation - adjust based on business logic)
                BigDecimal platformRevenue = totalCommissionsPaid.multiply(new BigDecimal("0.1")); // Assuming 10%
                                                                                                   // platform fee

                return AdminDashboardResponse.builder()
                                .totalUsers(totalUsers)
                                .activeUsers(activeUsers)
                                .inactiveUsers(inactiveUsers)
                                .newUsersToday(newUsersToday)
                                .newUsersThisMonth(newUsersThisMonth)
                                .totalInvestments(totalInvestments)
                                .totalInvestmentsThisMonth(totalInvestmentsThisMonth)
                                .totalCommissionsPaid(totalCommissionsPaid)
                                .totalCommissionsThisMonth(totalCommissionsThisMonth)
                                .totalProperties(totalProperties)
                                .activeProperties(activeProperties)
                                .pendingPayouts(pendingPayouts)
                                .pendingPayoutAmount(pendingPayoutAmount)
                                .pendingKycDocuments(pendingKycDocuments)
                                .pendingSupportTickets(pendingSupportTickets)
                                .totalWalletBalance(totalWalletBalance)
                                .platformRevenue(platformRevenue)
                                .build();
        }

        /**
         * Get pending payouts with pagination
         */
        public PageResponse<PayoutResponse> getPendingPayouts(Pageable pageable) {
                log.info("Fetching pending payouts");

                Page<Payout> payoutPage = payoutRepository.findByStatusOrderByRequestedAtDesc("PENDING", pageable);

                return PageResponse.<PayoutResponse>builder()
                                .content(payoutPage.getContent().stream()
                                                .map(this::mapToPayoutResponse)
                                                .collect(Collectors.toList()))
                                .page(payoutPage.getNumber())
                                .size(payoutPage.getSize())
                                .totalElements(payoutPage.getTotalElements())
                                .totalPages(payoutPage.getTotalPages())
                                .last(payoutPage.isLast())
                                .build();
        }

        /**
         * Approve payout request
         */
        @Transactional
        public String approvePayout(String payoutId) {
                log.info("Approving payout: {}", payoutId);

                Payout payout = payoutRepository.findByPayoutId(payoutId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Payout not found with ID: " + payoutId));

                if (!"PENDING".equals(payout.getStatus())) {
                        throw new BadRequestException("Payout is already processed");
                }

                payout.setStatus("APPROVED");
                payout.setApprovedAt(LocalDateTime.now());
                payoutRepository.save(payout);

                // Send notification to user
                notificationService.sendNotification(
                                payout.getUser().getId(),
                                "Payout Approved",
                                "Your withdrawal request of ₹" + payout.getRequestedAmount() + " has been approved.",
                                "PAYOUT");

                log.info("Payout {} approved successfully", payoutId);
                return "Payout approved successfully";
        }

        /**
         * Reject payout request
         */
        @Transactional
        public String rejectPayout(String payoutId, String reason) {
                log.info("Rejecting payout: {} with reason: {}", payoutId, reason);

                Payout payout = payoutRepository.findByPayoutId(payoutId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Payout not found with ID: " + payoutId));

                if (!"PENDING".equals(payout.getStatus())) {
                        throw new BadRequestException("Payout is already processed");
                }

                payout.setStatus("REJECTED");
                payout.setRejectionReason(reason);
                payoutRepository.save(payout);

                // Refund amount to user's wallet
                Wallet wallet = walletRepository.findByUser(payout.getUser())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Wallet not found for user ID: " + payout.getUser().getId()));
                wallet.setCommissionBalance(wallet.getCommissionBalance().add(payout.getRequestedAmount()));
                walletRepository.save(wallet);

                // Send notification to user
                notificationService.sendNotification(
                                payout.getUser().getId(),
                                "Payout Rejected",
                                "Your withdrawal request has been rejected. Reason: " + reason,
                                "PAYOUT");

                log.info("Payout {} rejected successfully", payoutId);
                return "Payout rejected successfully";
        }

        /**
         * Get pending KYC documents with pagination
         */
        public PageResponse<KycDocumentResponse> getPendingKyc(Pageable pageable) {
                log.info("Fetching pending KYC documents");

                Page<KycDocument> kycPage = kycDocumentRepository.findByStatusOrderByCreatedAtDesc("PENDING",
                                pageable);

                return PageResponse.<KycDocumentResponse>builder()
                                .content(kycPage.getContent().stream()
                                                .map(this::mapToKycDocumentResponse)
                                                .collect(Collectors.toList()))
                                .page(kycPage.getNumber())
                                .size(kycPage.getSize())
                                .totalElements(kycPage.getTotalElements())
                                .totalPages(kycPage.getTotalPages())
                                .last(kycPage.isLast())
                                .build();
        }

        /**
         * Approve KYC document
         */
        @Transactional
        public String approveKyc(Long kycId) {
                log.info("Approving KYC document: {}", kycId);

                KycDocument kycDocument = kycDocumentRepository.findById(kycId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "KYC document not found with ID: " + kycId));

                if (!"PENDING".equals(kycDocument.getStatus())) {
                        throw new BadRequestException("KYC document is already processed");
                }

                kycDocument.setStatus("APPROVED");
                kycDocument.setVerifiedAt(LocalDateTime.now());
                kycDocumentRepository.save(kycDocument);

                // Update user KYC status if all documents are approved
                updateUserKycStatus(kycDocument.getUser());

                // Send notification to user
                notificationService.sendNotification(
                                kycDocument.getUser().getId(),
                                "KYC Document Approved",
                                "Your " + kycDocument.getDocumentType() + " has been verified successfully.",
                                "KYC");

                log.info("KYC document {} approved successfully", kycId);
                return "KYC document approved successfully";
        }

        /**
         * Reject KYC document
         */
        @Transactional
        public String rejectKyc(Long kycId, String reason) {
                log.info("Rejecting KYC document: {} with reason: {}", kycId, reason);

                KycDocument kycDocument = kycDocumentRepository.findById(kycId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "KYC document not found with ID: " + kycId));

                if (!"PENDING".equals(kycDocument.getStatus())) {
                        throw new BadRequestException("KYC document is already processed");
                }

                kycDocument.setStatus("REJECTED");
                kycDocument.setRejectionReason(reason);
                kycDocumentRepository.save(kycDocument);

                // Send notification to user
                notificationService.sendNotification(
                                kycDocument.getUser().getId(),
                                "KYC Document Rejected",
                                "Your " + kycDocument.getDocumentType() + " was rejected. Reason: " + reason,
                                "KYC");

                log.info("KYC document {} rejected successfully", kycId);
                return "KYC document rejected successfully";
        }

        // Helper methods

        private void updateUserKycStatus(User user) {
                long totalDocs = kycDocumentRepository.countByUser(user);
                long approvedDocs = kycDocumentRepository.countByUserAndStatus(user, "APPROVED");

                if (totalDocs > 0 && totalDocs == approvedDocs) {
                        user.setKycStatus("APPROVED");
                        user.setKycLevel("LEVEL_3");
                        userRepository.save(user);
                }
        }

        private UserResponse mapToUserResponse(User user) {
                return UserResponse.builder()
                                .id(user.getId())
                                .userId(user.getUserId())
                                .fullName(user.getFullName())
                                .email(user.getEmail())
                                .mobile(user.getMobile())
                                .dateOfBirth(user.getDateOfBirth())
                                .gender(user.getGender())
                                .address(user.getAddress())
                                .city(user.getCity())
                                .state(user.getState())
                                .pincode(user.getPincode())
                                .country(user.getCountry())
                                .sponsorId(user.getSponsorId())
                                .placementId(user.getPlacementUser() != null ? user.getPlacementUser().getUserId()
                                                : null)
                                .placementSide(user.getPlacement())
                                .rank(user.getRank())
                                .status(user.getStatus())
                                .kycStatus(user.getKycStatus())
                                .totalEarnings(user.getTotalEarnings())
                                .totalInvestment(user.getTotalInvestment())
                                .profilePicture(user.getProfilePicture())
                                .createdAt(user.getCreatedAt())
                                .build();
        }

        private PayoutResponse mapToPayoutResponse(Payout payout) {
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
                                .accountHolderName(payout.getAccountHolderName())
                                .branchName(payout.getBranchName())
                                .upiId(payout.getUpiId())
                                .status(payout.getStatus())
                                .requestedAt(payout.getRequestedAt())
                                .approvedAt(payout.getApprovedAt())
                                .completedAt(payout.getCompletedAt())
                                .utrNumber(payout.getUtrNumber())
                                .rejectionReason(payout.getRejectionReason())
                                .build();
        }

        private KycDocumentResponse mapToKycDocumentResponse(KycDocument kycDocument) {
                return KycDocumentResponse.builder()

                                .id(kycDocument.getId())
                                .userId(kycDocument.getUser().getUserId())
                                .userName(kycDocument.getUser().getFullName())
                                .documentType(kycDocument.getDocumentType())
                                .documentNumber(kycDocument.getDocumentNumber())
                                .documentFileUrl(kycDocument.getDocumentFileUrl())
                                .status(kycDocument.getStatus())
                                .createdAt(kycDocument.getCreatedAt())
                                .verifiedAt(kycDocument.getVerifiedAt())
                                .rejectionReason(kycDocument.getRejectionReason())
                                .build();
        }
}
