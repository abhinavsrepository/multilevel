package com.realestate.mlm.service;

import com.realestate.mlm.dto.request.InstallmentPaymentRequest;
import com.realestate.mlm.dto.request.PropertyInvestmentRequest;
import com.realestate.mlm.dto.response.PropertyInvestmentResponse;
import com.realestate.mlm.dto.response.PropertyResponse;
import com.realestate.mlm.dto.response.PortfolioSummaryResponse;
import com.realestate.mlm.exception.BadRequestException;
import com.realestate.mlm.exception.InsufficientBalanceException;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvestmentService {

    private final PropertyInvestmentRepository investmentRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final InstallmentPaymentRepository installmentPaymentRepository;
    private final WalletService walletService;
    private final CommissionService commissionService;
    private final NotificationService notificationService;

    /**
     * Create investment with complete flow
     */
    @Transactional
    public PropertyInvestmentResponse createInvestment(PropertyInvestmentRequest request, String userId) {
        log.info("Creating investment for user: {}, property: {}, amount: {}",
                userId, request.getPropertyId(), request.getInvestmentAmount());

        // Find user
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Validate KYC status
        if (!"FULL".equals(user.getKycLevel()) && !"PREMIUM".equals(user.getKycLevel())) {
            throw new BadRequestException("KYC verification required. Please complete FULL or PREMIUM KYC to invest.");
        }

        // Find property
        Property property = propertyRepository.findByPropertyId(request.getPropertyId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));

        // Validate property is available
        if (!"ACTIVE".equals(property.getStatus())) {
            throw new BadRequestException("Property is not available for investment");
        }

        // Validate minimum investment
        if (request.getInvestmentAmount().compareTo(property.getMinimumInvestment()) < 0) {
            throw new BadRequestException(String.format(
                    "Minimum investment required: Rs %s",
                    property.getMinimumInvestment()));
        }

        // Check available slots
        int availableSlots = property.getTotalInvestmentSlots() - property.getSlotsBooked();
        int requestedSlots = request.getInvestmentAmount()
                .divide(property.getMinimumInvestment(), 0, RoundingMode.DOWN)
                .intValue();

        if (requestedSlots > availableSlots) {
            throw new BadRequestException(String.format(
                    "Only %d slots available. Requested: %d slots",
                    availableSlots, requestedSlots));
        }

        // Calculate investment amount based on payment type
        BigDecimal totalInvestmentAmount = request.getInvestmentAmount();
        BigDecimal initialPayment = totalInvestmentAmount;

        if ("INSTALLMENT".equals(request.getInvestmentType())) {
            // For installment, validate installment details
            if (request.getTotalInstallments() == null || request.getTotalInstallments() < 1) {
                throw new BadRequestException("Total installments required for installment payment");
            }

            // For installment, user pays first installment now
            initialPayment = totalInvestmentAmount
                    .divide(BigDecimal.valueOf(request.getTotalInstallments()), 2, RoundingMode.HALF_UP);
        }

        // Debit from investment wallet
        walletService.debitWallet(user, initialPayment, "INVESTMENT",
                String.format("Investment in property %s", property.getTitle()));

        // Calculate BV value
        BigDecimal bvAllocated = property.getBvValue() != null
                ? property.getBvValue()
                        .multiply(request.getInvestmentAmount())
                        .divide(property.getInvestmentPrice(), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Create investment record
        PropertyInvestment investment = new PropertyInvestment();
        investment.setInvestmentId(generateInvestmentId());
        investment.setProperty(property);
        investment.setUser(user);
        investment.setInvestmentAmount(totalInvestmentAmount);
        investment.setBvAllocated(bvAllocated);
        investment.setInvestmentType(request.getInvestmentType());
        investment.setPaymentMethod(request.getPaymentMethod());
        investment.setNomineeName(request.getNomineeName());
        investment.setNomineeRelation(request.getNomineeRelation());
        investment.setNomineeContact(request.getNomineeContact());

        // Set status based on payment type
        if ("LUMPSUM".equals(request.getInvestmentType())) {
            investment.setInvestmentStatus("ACTIVE");
            investment.setBookingStatus("CONFIRMED");
            investment.setTotalPaid(totalInvestmentAmount);
            investment.setPendingAmount(BigDecimal.ZERO);
        } else {
            investment.setInstallmentPlan(request.getInstallmentPlan());
            investment.setTotalInstallments(request.getTotalInstallments());
            investment.setInstallmentsPaid(1);
            investment.setInstallmentAmount(initialPayment);
            investment.setTotalPaid(initialPayment);
            investment.setPendingAmount(totalInvestmentAmount.subtract(initialPayment));
            investment.setInvestmentStatus("ACTIVE");
            investment.setBookingStatus("PROVISIONAL");
        }

        investment.setCurrentValue(totalInvestmentAmount);
        investment.setCommissionEligible(true);
        investment.setCommissionStatus("PENDING");
        investment.setExitRequested(false);
        investment.setLockInPeriodMonths(12); // Default 12 months lock-in
        investment.setLockInEndDate(LocalDate.now().plusMonths(12));

        // Calculate expected maturity date
        if (property.getRoiTenureMonths() != null) {
            investment.setExpectedMaturityDate(LocalDate.now().plusMonths(property.getRoiTenureMonths()));
        }

        PropertyInvestment savedInvestment = investmentRepository.save(investment);

        // Update property slots booked
        property.setSlotsBooked(property.getSlotsBooked() + requestedSlots);
        if (property.getSlotsBooked().equals(property.getTotalInvestmentSlots())) {
            property.setStatus("SOLD_OUT");
        }
        propertyRepository.save(property);

        // Create installment schedule if applicable
        if ("INSTALLMENT".equals(request.getInvestmentType())) {
            createInstallmentSchedule(savedInvestment);
        }

        // Allocate BV to user's upline (binary tree)
        allocateBVToTree(user, bvAllocated);

        // Calculate and credit commissions
        calculateInvestmentCommissions(user, savedInvestment);

        // Send confirmation email
        notificationService.sendInvestmentConfirmation(
                user.getEmail(),
                user.getFullName(),
                property.getTitle(),
                totalInvestmentAmount.toPlainString());

        log.info("Investment created successfully: {}", savedInvestment.getInvestmentId());

        return mapToResponse(savedInvestment);
    }

    /**
     * Create installment schedule
     */
    @Transactional
    public void createInstallmentSchedule(PropertyInvestment investment) {
        log.info("Creating installment schedule for investment: {}", investment.getInvestmentId());

        int totalInstallments = investment.getTotalInstallments();
        BigDecimal installmentAmount = investment.getInstallmentAmount();

        // First installment already paid during investment creation
        for (int i = 2; i <= totalInstallments; i++) {
            InstallmentPayment installment = new InstallmentPayment();
            installment.setPaymentId(generatePaymentId());
            installment.setInvestment(investment);
            installment.setInstallmentNumber(i);
            installment.setInstallmentAmount(installmentAmount);
            installment.setStatus("PENDING");
            installment.setReminderSent(false);

            // Calculate due date based on installment plan
            LocalDate dueDate = calculateDueDate(investment, i);
            installment.setDueDate(dueDate);

            installmentPaymentRepository.save(installment);
        }

        // Update next installment date
        investment.setNextInstallmentDate(calculateDueDate(investment, 2));
        investmentRepository.save(investment);

        log.info("Created {} installments for investment: {}", totalInstallments - 1, investment.getInvestmentId());
    }

    /**
     * Process installment payment
     */
    @Transactional
    public String processInstallmentPayment(Long installmentId, String userId) {
        log.info("Processing installment payment ID: {} for user: {}", installmentId, userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        InstallmentPayment installment = installmentPaymentRepository.findById(installmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Installment not found with ID: " + installmentId));

        PropertyInvestment investment = installment.getInvestment();

        // Validate user owns this investment
        if (!investment.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("This installment does not belong to you");
        }

        // Validate installment is pending
        if (!"PENDING".equals(installment.getStatus()) && !"OVERDUE".equals(installment.getStatus())) {
            throw new BadRequestException("Installment already paid");
        }

        // Debit from wallet
        walletService.debitWallet(user, installment.getInstallmentAmount(), "INVESTMENT",
                String.format("Installment payment %d/%d for %s",
                        installment.getInstallmentNumber(),
                        investment.getTotalInstallments(),
                        investment.getProperty().getTitle()));

        // Update installment status
        installment.setStatus("PAID");
        installment.setPaidAmount(installment.getInstallmentAmount());
        installment.setPaidDate(LocalDate.now());
        installmentPaymentRepository.save(installment);

        // Update investment
        investment.setInstallmentsPaid(investment.getInstallmentsPaid() + 1);
        investment.setTotalPaid(investment.getTotalPaid().add(installment.getInstallmentAmount()));
        investment.setPendingAmount(investment.getPendingAmount().subtract(installment.getInstallmentAmount()));

        // Check if all installments paid
        if (investment.getInstallmentsPaid().equals(investment.getTotalInstallments())) {
            investment.setBookingStatus("CONFIRMED");
            investment.setPendingAmount(BigDecimal.ZERO);
            log.info("All installments paid for investment: {}", investment.getInvestmentId());
        } else {
            // Update next installment date
            int nextInstallmentNumber = installment.getInstallmentNumber() + 1;
            if (nextInstallmentNumber <= investment.getTotalInstallments()) {
                investment.setNextInstallmentDate(calculateDueDate(investment, nextInstallmentNumber));
            }
        }

        investmentRepository.save(investment);

        log.info("Installment payment processed successfully");

        return "Installment paid successfully";
    }

    /**
     * Get user's all investments
     */
    public Page<PropertyInvestmentResponse> getMyInvestments(String userId, Pageable pageable) {
        log.info("Fetching investments for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Page<PropertyInvestment> investments = investmentRepository.findByUser(user, pageable);

        return investments.map(this::mapToResponse);
    }

    /**
     * Get investment portfolio summary
     */
    public PortfolioSummaryResponse getPortfolioSummary(String userId) {
        log.info("Fetching investment portfolio for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        List<PropertyInvestment> investments = investmentRepository.findByUser(user, Pageable.unpaged()).getContent();

        BigDecimal totalInvestment = BigDecimal.ZERO;
        BigDecimal currentValue = BigDecimal.ZERO;
        BigDecimal totalROI = BigDecimal.ZERO;
        int activeInvestments = 0;

        for (PropertyInvestment investment : investments) {
            if ("ACTIVE".equals(investment.getInvestmentStatus()) ||
                    "MATURED".equals(investment.getInvestmentStatus())) {

                totalInvestment = totalInvestment.add(investment.getInvestmentAmount());

                // Calculate current value with appreciation
                BigDecimal investmentCurrentValue = calculateCurrentValue(investment);
                currentValue = currentValue.add(investmentCurrentValue);

                totalROI = totalROI.add(investment.getRoiEarned());

                if ("ACTIVE".equals(investment.getInvestmentStatus())) {
                    activeInvestments++;
                }
            }
        }

        BigDecimal gains = currentValue.subtract(totalInvestment);
        BigDecimal roiPercent = totalInvestment.compareTo(BigDecimal.ZERO) > 0
                ? gains.multiply(BigDecimal.valueOf(100)).divide(totalInvestment, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return PortfolioSummaryResponse.builder()
                .totalInvestment(totalInvestment)
                .currentValue(currentValue)
                .totalAppreciation(gains)
                .appreciationPercentage(roiPercent)
                .roiEarned(totalROI)
                .activeInvestments(activeInvestments)
                .totalProperties(investments.size())
                .totalReturns(gains.add(totalROI))
                .build();
    }

    /**
     * Pay installment
     */
    @Transactional
    public String payInstallment(Long investmentId, InstallmentPaymentRequest request, String userId) {
        log.info("Paying installment for investment ID: {}, installment number: {}", investmentId,
                request.getInstallmentNumber());

        PropertyInvestment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Investment not found with ID: " + investmentId));

        InstallmentPayment installment = installmentPaymentRepository
                .findByInvestmentAndInstallmentNumber(investment, request.getInstallmentNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Installment not found"));

        return processInstallmentPayment(installment.getId(), userId);
    }

    /**
     * Request investment exit
     */
    @Transactional
    public String requestExit(Long investmentId, String userId) {
        log.info("Exit request for investment ID: {} by user: {}", investmentId, userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        PropertyInvestment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Investment not found with ID: " + investmentId));

        // Validate ownership
        if (!investment.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("This investment does not belong to you");
        }

        // Check lock-in period
        if (LocalDate.now().isBefore(investment.getLockInEndDate())) {
            throw new BadRequestException(String.format(
                    "Lock-in period not completed. Exit allowed after: %s",
                    investment.getLockInEndDate()));
        }

        // Check if already requested
        if (investment.getExitRequested()) {
            throw new BadRequestException("Exit already requested for this investment");
        }

        // Mark as exit requested
        investment.setExitRequested(true);
        investment.setInvestmentStatus("EXIT_REQUESTED");

        // Calculate exit amount
        BigDecimal exitAmount = calculateCurrentValue(investment);
        investment.setExitAmount(exitAmount);

        BigDecimal capitalGains = exitAmount.subtract(investment.getInvestmentAmount());
        investment.setCapitalGains(capitalGains);

        investmentRepository.save(investment);

        log.info("Exit request submitted for investment: {}", investment.getInvestmentId());

        return "Exit request submitted successfully. Our team will process it shortly.";
    }

    /**
     * Get investment details
     */
    public PropertyInvestmentResponse getInvestmentDetails(Long investmentId, String userId) {
        log.info("Fetching investment details for ID: {} and user: {}", investmentId, userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        PropertyInvestment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Investment not found with ID: " + investmentId));

        // Validate ownership
        if (!investment.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("This investment does not belong to you");
        }

        return mapToResponse(investment);
    }

    /**
     * Calculate current value with appreciation
     */
    public BigDecimal calculateCurrentValue(PropertyInvestment investment) {
        BigDecimal baseValue = investment.getInvestmentAmount();

        Property property = investment.getProperty();
        if (property.getAppreciationRateAnnual() != null) {
            // Calculate months passed
            long monthsPassed = java.time.temporal.ChronoUnit.MONTHS.between(
                    investment.getCreatedAt().toLocalDate(),
                    LocalDate.now());

            // Calculate appreciation
            BigDecimal monthlyRate = property.getAppreciationRateAnnual()
                    .divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);

            BigDecimal appreciation = baseValue
                    .multiply(monthlyRate)
                    .multiply(BigDecimal.valueOf(monthsPassed))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            return baseValue.add(appreciation);
        }

        return baseValue;
    }

    /**
     * Calculate total ROI
     */
    public BigDecimal calculateROI(PropertyInvestment investment) {
        BigDecimal currentValue = calculateCurrentValue(investment);
        BigDecimal totalROI = currentValue.subtract(investment.getInvestmentAmount());

        // Add rental income if any
        if (investment.getRentalIncomeEarned() != null) {
            totalROI = totalROI.add(investment.getRentalIncomeEarned());
        }

        return totalROI;
    }

    /**
     * Calculate due date for installment
     */
    private LocalDate calculateDueDate(PropertyInvestment investment, int installmentNumber) {
        LocalDate startDate = investment.getCreatedAt().toLocalDate();

        switch (investment.getInstallmentPlan()) {
            case "MONTHLY":
                return startDate.plusMonths(installmentNumber - 1);
            case "QUARTERLY":
                return startDate.plusMonths((installmentNumber - 1) * 3L);
            case "YEARLY":
                return startDate.plusYears(installmentNumber - 1);
            default:
                return startDate.plusMonths(installmentNumber - 1);
        }
    }

    /**
     * Allocate BV to binary tree
     */
    private void allocateBVToTree(User user, BigDecimal bv) {
        log.info("Allocating BV {} to tree for user: {}", bv, user.getUserId());

        // This should integrate with TreeService to allocate BV in binary tree
        // For now, we'll add to user's personal BV
        user.setPersonalBv(user.getPersonalBv().add(bv));
        userRepository.save(user);
    }

    /**
     * Calculate and credit investment commissions
     */
    private void calculateInvestmentCommissions(User investor, PropertyInvestment investment) {
        log.info("Calculating commissions for investment: {}", investment.getInvestmentId());

        BigDecimal investmentAmount = investment.getInvestmentAmount();

        // 1. Direct referral bonus to sponsor
        if (investor.getSponsor() != null) {
            commissionService.calculateDirectReferralBonus(
                    investor.getSponsor(),
                    investor,
                    investmentAmount);
        }

        // 2. Level commission to upline sponsors
        commissionService.calculateLevelCommission(investor, investmentAmount, 10);

        // 3. Binary pairing will be calculated in scheduled task

        log.info("Commissions calculated for investment: {}", investment.getInvestmentId());
    }

    /**
     * Generate unique investment ID
     */
    private String generateInvestmentId() {
        return "INV" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Generate unique payment ID
     */
    private String generatePaymentId() {
        return "PAY" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Map PropertyInvestment to PropertyInvestmentResponse
     */
    private PropertyInvestmentResponse mapToResponse(PropertyInvestment investment) {
        PropertyResponse propertyResponse = PropertyResponse.builder()
                .propertyId(investment.getProperty().getId())
                .title(investment.getProperty().getTitle())
                .city(investment.getProperty().getCity())
                .state(investment.getProperty().getState())
                .build();

        return PropertyInvestmentResponse.builder()
                .investmentId(investment.getId())
                .property(propertyResponse)
                .investmentAmount(investment.getInvestmentAmount())
                .investmentType(investment.getInvestmentType())
                .installmentPlan(investment.getInstallmentPlan())
                .totalInstallments(investment.getTotalInstallments())
                .installmentsPaid(investment.getInstallmentsPaid())
                .totalPaid(investment.getTotalPaid())
                .pendingAmount(investment.getPendingAmount())
                .investmentStatus(investment.getInvestmentStatus())
                .roiEarned(investment.getRoiEarned())
                .currentValue(calculateCurrentValue(investment))
                .createdAt(investment.getCreatedAt())
                .build();
    }

}
