package com.realestate.mlm.service;

import com.realestate.mlm.dto.request.ChangePasswordRequest;
import com.realestate.mlm.dto.request.UpdateProfileRequest;
import com.realestate.mlm.dto.response.ActivityResponse;
import com.realestate.mlm.dto.response.DashboardStatsResponse;
import com.realestate.mlm.dto.response.TeamCountResponse;
import com.realestate.mlm.dto.response.UserResponse;
import com.realestate.mlm.exception.BadRequestException;
import com.realestate.mlm.exception.ResourceNotFoundException;
import com.realestate.mlm.exception.UnauthorizedException;
import com.realestate.mlm.model.Transaction;
import com.realestate.mlm.model.User;
import com.realestate.mlm.model.Wallet;
import com.realestate.mlm.repository.PropertyInvestmentRepository;
import com.realestate.mlm.repository.TransactionRepository;
import com.realestate.mlm.repository.UserRepository;
import com.realestate.mlm.repository.WalletRepository;
import com.realestate.mlm.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PropertyInvestmentRepository propertyInvestmentRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get user by ID
     */
    public UserResponse getUserById(Long id) {
        log.info("Fetching user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        return mapToUserResponse(user);
    }

    /**
     * Get user profile by userId (MLM001, MLM002, etc.)
     */
    public UserResponse getUserProfile(String userId) {
        log.info("Fetching user profile for userId: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        return mapToUserResponse(user);
    }

    /**
     * Get current authenticated user's profile
     */
    public UserResponse getCurrentUserProfile() {
        String currentUserMlmId = SecurityUtil.getCurrentUserMlmId();
        log.info("Fetching current user profile: {}", currentUserMlmId);
        return getUserProfile(currentUserMlmId);
    }

    /**
     * Update user profile
     */
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        log.info("Updating profile for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Update fields
        user.setFullName(request.getFullName());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setPincode(request.getPincode());
        if (request.getCountry() != null && !request.getCountry().isEmpty()) {
            user.setCountry(request.getCountry());
        }

        User updatedUser = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", updatedUser.getUserId());

        return mapToUserResponse(updatedUser);
    }

    /**
     * Update current authenticated user's profile
     */
    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        log.info("Updating current user profile: ID {}", currentUserId);
        return updateProfile(currentUserId, request);
    }

    /**
     * Change user password
     */
    @Transactional
    public String changePassword(Long userId, ChangePasswordRequest request) {
        log.info("Changing password for user ID: {}", userId);

        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New passwords do not match");
        }

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Validate current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", user.getUserId());

        return "Password changed successfully";
    }

    /**
     * Change current authenticated user's password
     */
    @Transactional
    public String changePassword(ChangePasswordRequest request) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        log.info("Changing password for current user: ID {}", currentUserId);
        return changePassword(currentUserId, request);
    }

    /**
     * Get dashboard statistics for user
     */
    public DashboardStatsResponse getDashboard(String userId) {
        log.info("Fetching dashboard for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Get wallet
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        // Calculate team counts
        Map<String, Integer> teamCounts = getTeamCountMap(userId);

        // Get active properties count
        Long activePropertiesCount = propertyInvestmentRepository
                .findByUser(user, Pageable.unpaged())
                .stream()
                .filter(pi -> "ACTIVE".equals(pi.getInvestmentStatus()))
                .count();

        // Calculate today's income
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime todayEnd = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        BigDecimal todayIncome = calculateIncomeForPeriod(user, todayStart, todayEnd);

        // Calculate this month's income
        LocalDateTime monthStart = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIN);
        LocalDateTime monthEnd = LocalDateTime.now();
        BigDecimal thisMonthIncome = calculateIncomeForPeriod(user, monthStart, monthEnd);

        // Get recent activities (last 10 transactions)
        List<ActivityResponse> recentActivities = getRecentActivities(user, 10);

        return DashboardStatsResponse.builder()
                .totalInvestment(wallet.getTotalInvested())
                .totalEarnings(wallet.getTotalEarned())
                .totalWithdrawn(wallet.getTotalWithdrawn())
                .availableBalance(wallet.getWithdrawableBalance())
                .teamCount(teamCounts.get("total"))
                .leftTeamCount(teamCounts.get("left"))
                .rightTeamCount(teamCounts.get("right"))
                .activeProperties(activePropertiesCount.intValue())
                .pendingPayouts(0) // TODO: Implement payout counting
                .todayIncome(todayIncome)
                .thisMonthIncome(thisMonthIncome)
                .rank(user.getRank())
                .recentActivities(recentActivities)
                .build();
    }

    /**
     * Get dashboard statistics for current authenticated user
     */
    public DashboardStatsResponse getUserDashboard() {
        String currentUserMlmId = SecurityUtil.getCurrentUserMlmId();
        log.info("Fetching dashboard for current user: {}", currentUserMlmId);
        return getDashboard(currentUserMlmId);
    }

    /**
     * Calculate team count (left, right, total) recursively - returns Map
     */
    public Map<String, Integer> getTeamCountMap(String userId) {
        log.debug("Calculating team count for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Map<String, Integer> counts = new HashMap<>();
        counts.put("left", countTeamMembers(user, "LEFT"));
        counts.put("right", countTeamMembers(user, "RIGHT"));
        counts.put("total", counts.get("left") + counts.get("right"));

        return counts;
    }

    /**
     * Get team count for current authenticated user - returns TeamCountResponse
     */
    public TeamCountResponse getTeamCount() {
        String currentUserMlmId = SecurityUtil.getCurrentUserMlmId();
        log.info("Getting team count for current user: {}", currentUserMlmId);

        Map<String, Integer> counts = getTeamCountMap(currentUserMlmId);
        List<UserResponse> directReferrals = getDirectReferrals(currentUserMlmId);

        return TeamCountResponse.builder()
                .leftLegCount(counts.get("left"))
                .rightLegCount(counts.get("right"))
                .totalTeam(counts.get("total"))
                .directReferrals(directReferrals.size())
                .build();
    }

    /**
     * Count team members recursively in a specific leg
     */
    private Integer countTeamMembers(User user, String leg) {
        List<User> directMembers = userRepository.findByPlacementUserAndPlacement(user, leg);

        int count = directMembers.size();
        for (User member : directMembers) {
            count += countTeamMembers(member, "LEFT");
            count += countTeamMembers(member, "RIGHT");
        }

        return count;
    }

    /**
     * Calculate income for a specific period
     */
    private BigDecimal calculateIncomeForPeriod(User user, LocalDateTime start, LocalDateTime end) {
        Page<Transaction> transactions = transactionRepository.findByUserAndDateRange(
                user, start, end, Pageable.unpaged());

        return transactions.stream()
                .filter(t -> "CREDIT".equals(t.getType()))
                .filter(t -> List.of("COMMISSION", "RENTAL_INCOME", "ROI").contains(t.getCategory()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Get recent activities (transactions)
     */
    private List<ActivityResponse> getRecentActivities(User user, int limit) {
        Page<Transaction> transactions = transactionRepository.findByUser(
                user,
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")));

        return transactions.stream()
                .map(this::mapToActivityResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all users with pagination (Admin only)
     */
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        log.info("Fetching all users with pagination");

        Page<User> users = userRepository.findAll(pageable);

        return users.map(this::mapToUserResponse);
    }

    /**
     * Activate user (Admin only)
     */
    @Transactional
    public String activateUser(Long id) {
        log.info("Activating user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if ("ACTIVE".equals(user.getStatus())) {
            throw new BadRequestException("User is already active");
        }

        user.setStatus("ACTIVE");
        user.setActivationDate(LocalDateTime.now());
        userRepository.save(user);

        log.info("User activated successfully: {}", user.getUserId());

        return "User activated successfully";
    }

    /**
     * Block user (Admin only)
     */
    @Transactional
    public String blockUser(Long id) {
        log.info("Blocking user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if ("BLOCKED".equals(user.getStatus())) {
            throw new BadRequestException("User is already blocked");
        }

        user.setStatus("BLOCKED");
        userRepository.save(user);

        log.info("User blocked successfully: {}", user.getUserId());

        return "User blocked successfully";
    }

    /**
     * Unblock user (Admin only)
     */
    @Transactional
    public String unblockUser(Long id) {
        log.info("Unblocking user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (!"BLOCKED".equals(user.getStatus())) {
            throw new BadRequestException("User is not blocked");
        }

        user.setStatus("ACTIVE");
        userRepository.save(user);

        log.info("User unblocked successfully: {}", user.getUserId());

        return "User unblocked successfully";
    }

    /**
     * Get user's direct referrals
     */
    public List<UserResponse> getDirectReferrals(String userId) {
        log.info("Fetching direct referrals for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        List<User> referrals = userRepository.findBySponsorId(user.getUserId());

        return referrals.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get current authenticated user's direct referrals
     */
    public List<UserResponse> getDirectReferrals() {
        String currentUserMlmId = SecurityUtil.getCurrentUserMlmId();
        log.info("Fetching direct referrals for current user: {}", currentUserMlmId);
        return getDirectReferrals(currentUserMlmId);
    }

    /**
     * Map User entity to UserResponse DTO
     */
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
                .placementId(user.getPlacementUser() != null ? user.getPlacementUser().getUserId() : null)
                .placementSide(user.getPlacement())
                .status(user.getStatus())
                .role(user.getRole().name())
                .rank(user.getRank())
                .kycStatus(user.getKycStatus())
                .totalEarnings(user.getTotalEarnings())
                .totalInvestment(user.getTotalInvestment())
                .profilePicture(user.getProfilePicture())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Map Transaction to ActivityResponse
     */
    private ActivityResponse mapToActivityResponse(Transaction transaction) {
        return ActivityResponse.builder()
                .activityId(transaction.getId())
                .type(transaction.getType())
                .description(transaction.getDescription())
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    /**
     * Search users by name, email, or userId
     */
    public List<UserResponse> searchUsers(String query) {
        log.info("Searching users with query: {}", query);

        List<User> allUsers = userRepository.findAll();

        return allUsers.stream()
                .filter(user -> user.getFullName().toLowerCase().contains(query.toLowerCase()) ||
                        user.getEmail().toLowerCase().contains(query.toLowerCase()) ||
                        user.getUserId().toLowerCase().contains(query.toLowerCase()))
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get user statistics
     */
    public Map<String, Object> getUserStats(String userId) {
        log.info("Fetching statistics for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Map<String, Integer> teamCounts = getTeamCountMap(userId);
        List<User> directReferrals = userRepository.findBySponsorId(user.getUserId());

        Map<String, Object> stats = new HashMap<>();
        stats.put("userId", user.getUserId());
        stats.put("rank", user.getRank());
        stats.put("level", user.getLevel());
        stats.put("directReferrals", directReferrals.size());
        stats.put("teamCount", teamCounts.get("total"));
        stats.put("leftTeamCount", teamCounts.get("left"));
        stats.put("rightTeamCount", teamCounts.get("right"));
        stats.put("totalInvestment", user.getTotalInvestment());
        stats.put("totalEarnings", user.getTotalEarnings());
        stats.put("leftBv", user.getLeftBv());
        stats.put("rightBv", user.getRightBv());

        return stats;
    }
}
