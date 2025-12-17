package com.realestate.mlm.service;

import com.realestate.mlm.dto.response.CommissionResponse;
import com.realestate.mlm.exception.ResourceNotFoundException;
import com.realestate.mlm.model.Commission;
import com.realestate.mlm.model.RankSetting;
import com.realestate.mlm.model.SystemSetting;
import com.realestate.mlm.model.User;
import com.realestate.mlm.repository.CommissionRepository;
import com.realestate.mlm.repository.RankSettingRepository;
import com.realestate.mlm.repository.SystemSettingRepository;
import com.realestate.mlm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.realestate.mlm.util.SecurityUtil;
import com.realestate.mlm.dto.response.CommissionSummaryResponse;
import com.realestate.mlm.dto.response.PageResponse;
import jakarta.persistence.criteria.Predicate;
import java.util.stream.Collectors;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommissionService {

    private final CommissionRepository commissionRepository;
    private final UserRepository userRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final RankSettingRepository rankSettingRepository;
    private final WalletService walletService;
    private final TreeService treeService;

    // Commission constants
    private static final BigDecimal DIRECT_REFERRAL_PERCENTAGE = new BigDecimal("2.00"); // 2%
    private static final BigDecimal PAIRING_BONUS_PER_PAIR = new BigDecimal("100.00"); // Rs 100 per pair
    private static final BigDecimal BV_PER_PAIR = new BigDecimal("10000.00"); // 10,000 BV = 1 pair
    private static final BigDecimal DAILY_CAP = new BigDecimal("25000.00"); // Max Rs 25,000 per day
    private static final int MAX_LEVEL_COMMISSION_LEVELS = 10;

    /**
     * Calculate and credit direct referral bonus
     */
    @Transactional
    public Commission calculateDirectReferralBonus(User sponsor, User newMember, BigDecimal investment) {
        log.info("Calculating direct referral bonus for sponsor: {}, newMember: {}, investment: {}",
                sponsor.getUserId(), newMember.getUserId(), investment);

        // Calculate 2% of investment
        BigDecimal commissionAmount = investment
                .multiply(DIRECT_REFERRAL_PERCENTAGE)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        // Apply daily capping
        BigDecimal finalAmount = applyDailyCapping(sponsor, commissionAmount);

        // Create commission record
        Commission commission = new Commission();
        commission.setCommissionId(generateCommissionId());
        commission.setUser(sponsor);
        commission.setFromUser(newMember);
        commission.setCommissionType("DIRECT_REFERRAL");
        commission.setLevel(1);
        commission.setAmount(finalAmount);
        commission.setPercentage(DIRECT_REFERRAL_PERCENTAGE);
        commission.setBaseAmount(investment);
        commission.setDescription(String.format("Direct referral bonus from %s", newMember.getFullName()));
        commission.setStatus("CREDITED");
        commission.setCapApplied(finalAmount.compareTo(commissionAmount) < 0);
        commission.setCappedAmount(commissionAmount.subtract(finalAmount));
        commission.setCreatedAt(LocalDateTime.now());

        Commission savedCommission = commissionRepository.save(commission);

        // Credit to sponsor's wallet
        if (finalAmount.compareTo(BigDecimal.ZERO) > 0) {
            walletService.creditWallet(
                    sponsor,
                    finalAmount,
                    "COMMISSION",
                    String.format("Direct referral bonus from %s", newMember.getUserId()));
        }

        log.info("Direct referral bonus credited: {} to sponsor: {}", finalAmount, sponsor.getUserId());

        return savedCommission;
    }

    /**
     * Calculate binary pairing commission
     */
    @Transactional
    public Commission calculateBinaryPairing(User user) {
        log.info("Calculating binary pairing commission for user: {}", user.getUserId());

        // Get current BV values
        BigDecimal leftBV = user.getLeftBv().add(user.getCarryForwardLeft());
        BigDecimal rightBV = user.getRightBv().add(user.getCarryForwardRight());

        log.debug("User: {}, Left BV: {}, Right BV: {}", user.getUserId(), leftBV, rightBV);

        // Calculate matched BV
        BigDecimal matchedBV = leftBV.min(rightBV);

        if (matchedBV.compareTo(BigDecimal.ZERO) <= 0) {
            log.info("No BV to match for user: {}", user.getUserId());
            return null;
        }

        // Calculate number of pairs
        BigDecimal pairs = matchedBV.divide(BV_PER_PAIR, 0, RoundingMode.DOWN);

        if (pairs.compareTo(BigDecimal.ZERO) <= 0) {
            log.info("No complete pairs for user: {}", user.getUserId());
            return null;
        }

        // Calculate commission
        BigDecimal commissionAmount = pairs.multiply(PAIRING_BONUS_PER_PAIR);

        // Apply daily capping
        BigDecimal finalAmount = applyDailyCapping(user, commissionAmount);

        // Calculate carry forward
        BigDecimal usedBV = pairs.multiply(BV_PER_PAIR);
        BigDecimal newCarryForwardLeft = leftBV.subtract(usedBV);
        BigDecimal newCarryForwardRight = rightBV.subtract(usedBV);

        // Update user's carry forward values
        user.setCarryForwardLeft(newCarryForwardLeft);
        user.setCarryForwardRight(newCarryForwardRight);

        // Reset current BV (already moved to carry forward)
        user.setLeftBv(BigDecimal.ZERO);
        user.setRightBv(BigDecimal.ZERO);

        userRepository.save(user);

        // Create commission record
        Commission commission = new Commission();
        commission.setCommissionId(generateCommissionId());
        commission.setUser(user);
        commission.setFromUser(null);
        commission.setCommissionType("BINARY_PAIRING");
        commission.setLevel(0);
        commission.setAmount(finalAmount);
        commission.setBaseAmount(usedBV);
        commission.setBusinessVolume(usedBV);
        commission.setDescription(String.format("Binary pairing bonus - %s pairs matched", pairs.intValue()));
        commission.setCalculationDetails(String.format(
                "{\"pairs\": %s, \"leftBV\": %s, \"rightBV\": %s, \"matchedBV\": %s, \"usedBV\": %s, \"carryForwardLeft\": %s, \"carryForwardRight\": %s}",
                pairs, leftBV, rightBV, matchedBV, usedBV, newCarryForwardLeft, newCarryForwardRight));
        commission.setStatus("CREDITED");
        commission.setCapApplied(finalAmount.compareTo(commissionAmount) < 0);
        commission.setCappedAmount(commissionAmount.subtract(finalAmount));
        commission.setCreatedAt(LocalDateTime.now());

        Commission savedCommission = commissionRepository.save(commission);

        // Credit to user's wallet
        if (finalAmount.compareTo(BigDecimal.ZERO) > 0) {
            walletService.creditWallet(
                    user,
                    finalAmount,
                    "COMMISSION",
                    String.format("Binary pairing bonus - %s pairs", pairs.intValue()));
        }

        log.info("Binary pairing commission credited: {} to user: {}, pairs: {}",
                finalAmount, user.getUserId(), pairs);

        return savedCommission;
    }

    /**
     * Calculate level commission (distributed to upline sponsors)
     */
    @Transactional
    public List<Commission> calculateLevelCommission(User fromUser, BigDecimal amount, int maxLevel) {
        log.info("Calculating level commission from user: {}, amount: {}, maxLevel: {}",
                fromUser.getUserId(), amount, maxLevel);

        List<Commission> commissions = new ArrayList<>();

        // Get level percentages from system settings or use default
        List<BigDecimal> levelPercentages = getLevelPercentages();

        // Traverse up the sponsor chain
        User currentSponsor = fromUser.getSponsor();
        int level = 1;

        while (currentSponsor != null && level <= maxLevel && level <= levelPercentages.size()) {
            // Check if sponsor is active
            if ("ACTIVE".equals(currentSponsor.getStatus())) {
                BigDecimal percentage = levelPercentages.get(level - 1);
                BigDecimal commissionAmount = amount
                        .multiply(percentage)
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

                // Apply daily capping
                BigDecimal finalAmount = applyDailyCapping(currentSponsor, commissionAmount);

                if (finalAmount.compareTo(BigDecimal.ZERO) > 0) {
                    // Create commission record
                    Commission commission = new Commission();
                    commission.setCommissionId(generateCommissionId());
                    commission.setUser(currentSponsor);
                    commission.setFromUser(fromUser);
                    commission.setCommissionType(String.format("LEVEL_%d", level));
                    commission.setLevel(level);
                    commission.setAmount(finalAmount);
                    commission.setPercentage(percentage);
                    commission.setBaseAmount(amount);
                    commission.setDescription(
                            String.format("Level %d commission from %s", level, fromUser.getFullName()));
                    commission.setStatus("CREDITED");
                    commission.setCapApplied(finalAmount.compareTo(commissionAmount) < 0);
                    commission.setCappedAmount(commissionAmount.subtract(finalAmount));
                    commission.setCreatedAt(LocalDateTime.now());

                    Commission savedCommission = commissionRepository.save(commission);
                    commissions.add(savedCommission);

                    // Credit to sponsor's wallet
                    walletService.creditWallet(
                            currentSponsor,
                            finalAmount,
                            "COMMISSION",
                            String.format("Level %d commission from %s", level, fromUser.getUserId()));

                    log.info("Level {} commission credited: {} to sponsor: {}",
                            level, finalAmount, currentSponsor.getUserId());
                }
            } else {
                log.debug("Skipping inactive sponsor at level {}: {}", level, currentSponsor.getUserId());
            }

            // Move to next sponsor
            currentSponsor = currentSponsor.getSponsor();
            level++;
        }

        log.info("Level commission calculation completed. Total commissions: {}", commissions.size());

        return commissions;
    }

    /**
     * Apply daily capping to commission
     */
    private BigDecimal applyDailyCapping(User user, BigDecimal commission) {
        log.debug("Applying daily capping for user: {}, commission: {}", user.getUserId(), commission);

        // Get today's total commissions
        BigDecimal todayTotal = getTodayCommissions(user);

        // Check if user has reached daily cap
        if (todayTotal.compareTo(DAILY_CAP) >= 0) {
            log.warn("User {} has reached daily cap. No commission credited.", user.getUserId());
            return BigDecimal.ZERO;
        }

        // Calculate remaining cap
        BigDecimal remainingCap = DAILY_CAP.subtract(todayTotal);

        // Return minimum of commission and remaining cap
        BigDecimal finalAmount = commission.min(remainingCap);

        if (finalAmount.compareTo(commission) < 0) {
            log.info("Commission capped for user: {}. Original: {}, Capped: {}",
                    user.getUserId(), commission, finalAmount);
        }

        return finalAmount;
    }

    /**
     * Get total commissions earned today
     * OPTIMIZED: Uses database query instead of loading all records into memory
     */
    private BigDecimal getTodayCommissions(User user) {
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime todayEnd = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        // Use optimized repository query that runs directly on the database
        return commissionRepository.sumCommissionsByUserBetweenDates(
                user,
                "CREDITED",
                todayStart,
                todayEnd);
    }

    /**
     * Credit commission to user (general purpose)
     */
    @Transactional
    public Commission creditCommission(
            User user,
            BigDecimal amount,
            String type,
            String description) {
        log.info("Crediting commission to user: {}, amount: {}, type: {}", user.getUserId(), amount, type);

        // Apply daily capping
        BigDecimal finalAmount = applyDailyCapping(user, amount);

        // Create commission record
        Commission commission = new Commission();
        commission.setCommissionId(generateCommissionId());
        commission.setUser(user);
        commission.setCommissionType(type);
        commission.setLevel(0);
        commission.setAmount(finalAmount);
        commission.setDescription(description);
        commission.setStatus("CREDITED");
        commission.setCapApplied(finalAmount.compareTo(amount) < 0);
        commission.setCappedAmount(amount.subtract(finalAmount));
        commission.setCreatedAt(LocalDateTime.now());

        Commission savedCommission = commissionRepository.save(commission);

        // Credit to wallet
        if (finalAmount.compareTo(BigDecimal.ZERO) > 0) {
            walletService.creditWallet(user, finalAmount, "COMMISSION", description);
        }

        log.info("Commission credited successfully: {} to user: {}", finalAmount, user.getUserId());

        return savedCommission;
    }

    /**
     * Get level commission percentages from system settings
     */
    private List<BigDecimal> getLevelPercentages() {
        // Try to get from system settings
        Optional<SystemSetting> setting = systemSettingRepository.findBySettingKey("level_commission_percentages");

        if (setting.isPresent()) {
            String value = setting.get().getSettingValue();
            // Parse comma-separated values: "3.0,2.0,1.5,1.0,1.0,0.5,0.5,0.5,0.5,0.5"
            return Arrays.stream(value.split(","))
                    .map(String::trim)
                    .map(BigDecimal::new)
                    .toList();
        }

        // Default percentages
        return Arrays.asList(
                new BigDecimal("3.0"), // Level 1: 3%
                new BigDecimal("2.0"), // Level 2: 2%
                new BigDecimal("1.5"), // Level 3: 1.5%
                new BigDecimal("1.0"), // Level 4: 1%
                new BigDecimal("1.0"), // Level 5: 1%
                new BigDecimal("0.5"), // Level 6: 0.5%
                new BigDecimal("0.5"), // Level 7: 0.5%
                new BigDecimal("0.5"), // Level 8: 0.5%
                new BigDecimal("0.5"), // Level 9: 0.5%
                new BigDecimal("0.5") // Level 10: 0.5%
        );
    }

    /**
     * Generate unique commission ID
     */
    private String generateCommissionId() {
        return "COM" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Get commission history for user
     */
    public Page<CommissionResponse> getCommissionHistory(String userId, Pageable pageable) {
        log.info("Fetching commission history for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Page<Commission> commissions = commissionRepository.findByUser(user, pageable);

        return commissions.map(this::mapToCommissionResponse);
    }

    /**
     * Get commission history by type
     */
    public Page<CommissionResponse> getCommissionHistoryByType(
            String userId,
            String commissionType,
            Pageable pageable) {
        log.info("Fetching commission history for user: {}, type: {}", userId, commissionType);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Page<Commission> commissions = commissionRepository.findByUserAndCommissionType(user, commissionType, pageable);

        return commissions.map(this::mapToCommissionResponse);
    }

    /**
     * Get total commission earned by user
     */
    public BigDecimal getTotalCommissionEarned(String userId) {
        log.info("Calculating total commission for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Double total = commissionRepository.sumCommissionsByUserAndType(user, null);

        return total != null ? BigDecimal.valueOf(total) : BigDecimal.ZERO;
    }

    /**
     * Get commission summary by type
     */
    public Map<String, BigDecimal> getCommissionSummary(String userId) {
        log.info("Fetching commission summary for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Map<String, BigDecimal> summary = new HashMap<>();

        // Get all commission types
        List<String> types = Arrays.asList(
                "DIRECT_REFERRAL",
                "BINARY_PAIRING",
                "LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "LEVEL_5");

        for (String type : types) {
            Double total = commissionRepository.sumCommissionsByUserAndType(user, type);
            summary.put(type, total != null ? BigDecimal.valueOf(total) : BigDecimal.ZERO);
        }

        return summary;
    }

    /**
     * Process binary pairing for all active users (scheduled task)
     * Returns the number of commissions processed
     */
    @Transactional
    public int processAllPendingMatching() {
        log.info("Processing binary pairing for all active users");

        List<User> activeUsers = userRepository.findByStatus("ACTIVE");

        int processed = 0;
        for (User user : activeUsers) {
            try {
                Commission commission = calculateBinaryPairing(user);
                if (commission != null) {
                    processed++;
                }
            } catch (Exception e) {
                log.error("Error processing binary pairing for user: {}", user.getUserId(), e);
            }
        }

        log.info("Binary pairing processing completed. Processed: {} users", processed);
        return processed;
    }

    /**
     * Process rank promotions for all active users
     * Returns the number of users promoted
     */
    @Transactional
    public int processRankPromotions() {
        log.info("Processing rank promotions for all active users");

        List<User> activeUsers = userRepository.findByStatus("ACTIVE");
        List<RankSetting> ranks = rankSettingRepository.findByIsActiveTrueOrderByDisplayOrder();

        int promotedCount = 0;

        for (User user : activeUsers) {
            try {
                if (checkAndPromoteUser(user, ranks)) {
                    promotedCount++;
                }
            } catch (Exception e) {
                log.error("Error processing rank promotion for user: {}", user.getUserId(), e);
            }
        }

        log.info("Rank promotion processing completed. Promoted: {} users", promotedCount);
        return promotedCount;
    }

    /**
     * Check if user is eligible for rank promotion and promote if yes
     */
    private boolean checkAndPromoteUser(User user, List<RankSetting> ranks) {
        String currentRankName = user.getRank();
        RankSetting currentRank = ranks.stream()
                .filter(r -> r.getRankName().equalsIgnoreCase(currentRankName))
                .findFirst()
                .orElse(null);

        int currentOrder = currentRank != null ? currentRank.getDisplayOrder() : 0;

        // Check next ranks
        for (RankSetting rank : ranks) {
            if (rank.getDisplayOrder() > currentOrder) {
                // Check eligibility
                boolean eligible = true;

                // 1. Check direct referrals
                if (rank.getRequiredDirectReferrals() > 0) {
                    long directReferrals = userRepository.countBySponsorId(user.getUserId());
                    if (directReferrals < rank.getRequiredDirectReferrals()) {
                        eligible = false;
                    }
                }

                // 2. Check personal investment
                if (eligible && rank.getRequiredPersonalInvestment().compareTo(BigDecimal.ZERO) > 0) {
                    if (user.getTotalInvestment().compareTo(rank.getRequiredPersonalInvestment()) < 0) {
                        eligible = false;
                    }
                }

                // 3. Check team investment (Team BV)
                if (eligible && rank.getRequiredTeamInvestment().compareTo(BigDecimal.ZERO) > 0) {
                    if (user.getTeamBv().compareTo(rank.getRequiredTeamInvestment()) < 0) {
                        eligible = false;
                    }
                }

                if (eligible) {
                    // Promote user
                    log.info("Promoting user {} from {} to {}", user.getUserId(), currentRankName, rank.getRankName());

                    user.setRank(rank.getRankName());
                    user.setRankAchievedDate(LocalDateTime.now());
                    userRepository.save(user);

                    // Credit one-time bonus if applicable
                    if (rank.getOneTimeBonus() != null && rank.getOneTimeBonus().compareTo(BigDecimal.ZERO) > 0) {
                        walletService.creditWallet(
                                user,
                                rank.getOneTimeBonus(),
                                "RANK_BONUS",
                                "Rank achievement bonus for " + rank.getRankName());

                        // Create commission record for reporting
                        Commission commission = new Commission();
                        commission.setCommissionId(generateCommissionId());
                        commission.setUser(user);
                        commission.setCommissionType("RANK_BONUS");
                        commission.setAmount(rank.getOneTimeBonus());
                        commission.setDescription("Rank achievement bonus for " + rank.getRankName());
                        commission.setStatus("CREDITED");
                        commission.setCreatedAt(LocalDateTime.now());
                        commissionRepository.save(commission);
                    }

                    return true; // Promoted to next level, stop checking higher levels for now (one promotion
                                 // per run)
                }
            }
        }

        return false;
    }

    /**
     * Map Commission to CommissionResponse
     */
    private CommissionResponse mapToCommissionResponse(Commission commission) {
        return CommissionResponse.builder()
                .commissionId(commission.getId())
                .commissionType(commission.getCommissionType())
                .level(commission.getLevel())
                .amount(commission.getAmount())
                .percentage(commission.getPercentage())
                .baseAmount(commission.getBaseAmount())
                .description(commission.getDescription())
                .status(commission.getStatus())
                .paidAt(commission.getPaidAt())
                .createdAt(commission.getCreatedAt())
                .build();
    }

    /**
     * Recalculate all commissions for a user (admin function)
     */
    @Transactional
    public void recalculateCommissions(String userId) {
        log.info("Recalculating commissions for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Process binary pairing
        calculateBinaryPairing(user);

        log.info("Commission recalculation completed for user: {}", userId);
    }

    /**
     * Get commission history with filters for current user
     */
    public PageResponse<CommissionResponse> getCommissionHistory(
            Pageable pageable,
            String type,
            String status,
            String startDate,
            String endDate) {

        String userId = SecurityUtil.getCurrentUserMlmId();
        log.info("Fetching commission history for user: {}, type: {}, status: {}", userId, type, status);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Specification<Commission> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user"), user));

            if (type != null && !type.isEmpty()) {
                predicates.add(cb.equal(root.get("commissionType"), type));
            }

            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (startDate != null && !startDate.isEmpty()) {
                LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }

            if (endDate != null && !endDate.isEmpty()) {
                LocalDateTime end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Commission> commissions = commissionRepository.findAll(spec, pageable);

        List<CommissionResponse> content = commissions.getContent().stream()
                .map(this::mapToCommissionResponse)
                .collect(Collectors.toList());

        return PageResponse.<CommissionResponse>builder()
                .content(content)
                .page(commissions.getNumber())
                .size(commissions.getSize())
                .totalElements(commissions.getTotalElements())
                .totalPages(commissions.getTotalPages())
                .last(commissions.isLast())
                .build();
    }

    /**
     * Get commission summary for current user
     */
    public CommissionSummaryResponse getCommissionSummary() {
        String userId = SecurityUtil.getCurrentUserMlmId();
        log.info("Fetching commission summary for current user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Get all commissions for user
        List<Commission> allCommissions = commissionRepository.findByUser(user, Pageable.unpaged()).getContent();

        BigDecimal totalEarnings = BigDecimal.ZERO;
        BigDecimal pendingCommissions = BigDecimal.ZERO;
        BigDecimal paidCommissions = BigDecimal.ZERO;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).with(LocalTime.MIN);
        LocalDateTime startOfDay = now.with(LocalTime.MIN);

        BigDecimal thisMonthEarnings = BigDecimal.ZERO;
        BigDecimal todayEarnings = BigDecimal.ZERO;

        // Calculate totals
        for (Commission c : allCommissions) {
            totalEarnings = totalEarnings.add(c.getAmount());

            if ("CREDITED".equals(c.getStatus()) || "PAID".equals(c.getStatus())) {
                paidCommissions = paidCommissions.add(c.getAmount());
            } else {
                pendingCommissions = pendingCommissions.add(c.getAmount());
            }

            if (c.getCreatedAt().isAfter(startOfMonth)) {
                thisMonthEarnings = thisMonthEarnings.add(c.getAmount());
            }

            if (c.getCreatedAt().isAfter(startOfDay)) {
                todayEarnings = todayEarnings.add(c.getAmount());
            }
        }

        // Group by type
        Map<String, List<Commission>> byTypeMap = allCommissions.stream()
                .collect(Collectors.groupingBy(Commission::getCommissionType));

        List<CommissionSummaryResponse.CommissionByType> byTypeList = new ArrayList<>();

        for (Map.Entry<String, List<Commission>> entry : byTypeMap.entrySet()) {
            String type = entry.getKey();
            List<Commission> typeCommissions = entry.getValue();

            BigDecimal typeTotal = typeCommissions.stream()
                    .map(Commission::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal typeMonth = typeCommissions.stream()
                    .filter(c -> c.getCreatedAt().isAfter(startOfMonth))
                    .map(Commission::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            byTypeList.add(CommissionSummaryResponse.CommissionByType.builder()
                    .type(type)
                    .typeName(type) // You might want to format this
                    .totalEarned(typeTotal)
                    .thisMonth(typeMonth)
                    .count(typeCommissions.size())
                    .percentage(totalEarnings.compareTo(BigDecimal.ZERO) > 0
                            ? typeTotal.divide(totalEarnings, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                            : BigDecimal.ZERO)
                    .build());
        }

        return CommissionSummaryResponse.builder()
                .totalEarnings(totalEarnings)
                .thisMonthEarnings(thisMonthEarnings)
                .todayEarnings(todayEarnings)
                .pendingCommissions(pendingCommissions)
                .paidCommissions(paidCommissions)
                .totalCommissionCount(allCommissions.size())
                .byType(byTypeList)
                .build();
    }

    /**
     * Get commissions by type for current user
     */
    public List<CommissionResponse> getCommissionsByType(String type) {
        String userId = SecurityUtil.getCurrentUserMlmId();
        log.info("Fetching commissions by type: {} for user: {}", type, userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Page<Commission> commissions = commissionRepository.findByUserAndCommissionType(user, type, Pageable.unpaged());

        return commissions.getContent().stream()
                .map(this::mapToCommissionResponse)
                .collect(Collectors.toList());
    }
}
