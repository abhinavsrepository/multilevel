package com.realestate.mlm.service;

import com.realestate.mlm.dto.request.LoginRequest;
import com.realestate.mlm.dto.request.OtpVerifyRequest;
import com.realestate.mlm.dto.request.RegisterRequest;
import com.realestate.mlm.dto.request.ResetPasswordRequest;
import com.realestate.mlm.dto.response.AuthResponse;
import com.realestate.mlm.dto.response.UserResponse;
import com.realestate.mlm.exception.BadRequestException;
import com.realestate.mlm.exception.InvalidSponsorException;
import com.realestate.mlm.exception.ResourceNotFoundException;
import com.realestate.mlm.exception.UnauthorizedException;
import com.realestate.mlm.model.User;
import com.realestate.mlm.model.Wallet;
import com.realestate.mlm.repository.UserRepository;
import com.realestate.mlm.security.CustomUserDetails;
import com.realestate.mlm.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final WalletService walletService;
    private final TreeService treeService;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    // In-memory storage for OTP and reset tokens (use Redis in production)
    private final ConcurrentHashMap<String, String> otpCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> resetTokenCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> refreshTokenCache = new ConcurrentHashMap<>();

    /**
     * Register a new user with complete MLM tree placement
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Starting registration for email: {}", request.getEmail());

        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already exists");
        }

        // Check if mobile already exists
        if (userRepository.findByMobile(request.getMobile()).isPresent()) {
            throw new BadRequestException("Mobile number already exists");
        }

        // Validate sponsor if provided
        User sponsor = null;
        if (request.getSponsorId() != null && !request.getSponsorId().isEmpty()) {
            sponsor = validateSponsorId(request.getSponsorId());
        }

        // Generate unique userId
        String userId = generateUserId();

        // Create new user
        User newUser = new User();
        newUser.setUserId(userId);
        newUser.setFullName(request.getFullName());
        newUser.setEmail(request.getEmail());
        newUser.setMobile(request.getMobile());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setStatus("PENDING"); // Pending OTP verification
        newUser.setRole(User.Role.MEMBER);
        newUser.setRank("Associate");
        newUser.setEmailVerified(false);
        newUser.setMobileVerified(false);
        newUser.setKycStatus("PENDING");
        newUser.setKycLevel("NONE");
        newUser.setReferralCode(generateReferralCode());
        newUser.setCreatedAt(LocalDateTime.now());

        // Set sponsor details
        if (sponsor != null) {
            newUser.setSponsorId(sponsor.getUserId());
            newUser.setSponsor(sponsor);
            newUser.setPlacement(request.getPlacement());

            // Find placement position in binary tree
            User[] placementResult = treeService.findPlacementPosition(sponsor.getUserId(), request.getPlacement());
            User placementUser = placementResult[0];
            String actualPlacement = placementResult[1].getUserId(); // "LEFT" or "RIGHT"

            newUser.setPlacementUser(placementUser);
            newUser.setLevel(placementUser.getLevel() + 1);
        } else {
            // First user or no sponsor
            newUser.setLevel(0);
        }

        // Save user
        User savedUser = userRepository.save(newUser);
        log.info("User created with ID: {}", savedUser.getUserId());

        // Create wallet for the user
        walletService.createWallet(savedUser);
        log.info("Wallet created for user: {}", savedUser.getUserId());

        // Generate and send OTP
        String otp = generateOtp();
        otpCache.put(savedUser.getEmail(), otp);
        sendEmailOtp(savedUser.getEmail(), otp);
        log.info("OTP sent to email: {}", savedUser.getEmail());

        // Create response
        UserResponse userResponse = mapToUserResponse(savedUser);

        return AuthResponse.builder()
                .user(userResponse)
                .build();
    }

    /**
     * Login user and generate JWT tokens
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for: {}", request.getEmailOrMobile());

        // Find user by email or mobile
        User user = userRepository.findByEmail(request.getEmailOrMobile())
                .or(() -> userRepository.findByMobile(request.getEmailOrMobile()))
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        // Authenticate
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getEmail(),
                            request.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception e) {
            log.error("Authentication failed for user: {}", request.getEmailOrMobile());
            throw new UnauthorizedException("Invalid credentials");
        }

        // Check if user is active
        if (!"ACTIVE".equals(user.getStatus())) {
            if ("PENDING".equals(user.getStatus())) {
                throw new UnauthorizedException("Account pending verification. Please verify OTP.");
            } else if ("BLOCKED".equals(user.getStatus())) {
                throw new UnauthorizedException("Account is blocked. Please contact support.");
            }
            throw new UnauthorizedException("Account is not active");
        }

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate tokens
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtTokenProvider.generateToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        // Store refresh token
        refreshTokenCache.put(refreshToken, user.getEmail());

        log.info("User logged in successfully: {}", user.getUserId());

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(3600L) // 1 hour in seconds
                .user(mapToUserResponse(user))
                .build();
    }

    /**
     * Verify OTP and activate user
     */
    @Transactional
    public String verifyOtp(OtpVerifyRequest request) {
        log.info("OTP verification for: {}", request.getEmailOrMobile());

        // Find user
        User user = userRepository.findByEmail(request.getEmailOrMobile())
                .or(() -> userRepository.findByMobile(request.getEmailOrMobile()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get OTP from cache
        String cachedOtp = otpCache.get(user.getEmail());
        if (cachedOtp == null) {
            throw new BadRequestException("OTP expired or not found. Please request a new OTP.");
        }

        // Verify OTP
        if (!cachedOtp.equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP");
        }

        // Activate user
        user.setStatus("ACTIVE");
        user.setEmailVerified(true);
        user.setActivationDate(LocalDateTime.now());
        userRepository.save(user);

        // Remove OTP from cache
        otpCache.remove(user.getEmail());

        log.info("User activated successfully: {}", user.getUserId());

        // Send welcome email
        notificationService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        return "Account verified and activated successfully";
    }

    /**
     * Forgot password - generate reset token and send email
     */
    @Transactional
    public String forgotPassword(String email) {
        log.info("Forgot password request for: {}", email);

        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        resetTokenCache.put(resetToken, user.getEmail());

        // Send reset email
        notificationService.sendPasswordResetEmail(user.getEmail(), resetToken, user.getFullName());

        log.info("Password reset email sent to: {}", email);

        return "Password reset link has been sent to your email";
    }

    /**
     * Reset password using reset token
     */
    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        log.info("Password reset attempt with token");

        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Validate token
        String email = resetTokenCache.get(request.getToken());
        if (email == null) {
            throw new BadRequestException("Invalid or expired reset token");
        }

        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Remove token from cache
        resetTokenCache.remove(request.getToken());

        log.info("Password reset successfully for user: {}", user.getUserId());

        // Send confirmation email
        notificationService.sendPasswordChangedEmail(user.getEmail(), user.getFullName());

        return "Password reset successful";
    }

    /**
     * Refresh access token using refresh token
     */
    public AuthResponse refreshToken(String refreshToken) {
        log.info("Refreshing access token");

        // Validate refresh token
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        // Check if token exists in cache
        String email = refreshTokenCache.get(refreshToken);
        if (email == null) {
            throw new UnauthorizedException("Refresh token not found or expired");
        }

        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Generate new access token
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String newAccessToken = jwtTokenProvider.generateToken(userDetails);

        log.info("Access token refreshed for user: {}", user.getUserId());

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(refreshToken)
                .expiresIn(3600L)
                .user(mapToUserResponse(user))
                .build();
    }

    /**
     * Generate 6-digit OTP
     */
    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Send OTP via email
     */
    private void sendEmailOtp(String email, String otp) {
        notificationService.sendOtpEmail(email, otp);
    }

    /**
     * Validate sponsor ID
     */
    private User validateSponsorId(String sponsorId) {
        User sponsor = userRepository.findByUserId(sponsorId)
                .orElseThrow(() -> new InvalidSponsorException("Invalid sponsor ID: " + sponsorId));

        if (!"ACTIVE".equals(sponsor.getStatus())) {
            throw new InvalidSponsorException("Sponsor is not active: " + sponsorId);
        }

        return sponsor;
    }

    /**
     * Generate unique user ID (MLM001, MLM002, ...)
     */
    private String generateUserId() {
        long count = userRepository.count();
        return String.format("MLM%03d", count + 1);
    }

    /**
     * Generate unique referral code
     */
    private String generateReferralCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
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
     * Logout - invalidate refresh token
     */
    @CacheEvict(value = "refreshTokens", key = "#refreshToken")
    public String logout(String refreshToken) {
        refreshTokenCache.remove(refreshToken);
        SecurityContextHolder.clearContext();
        log.info("User logged out successfully");
        return "Logged out successfully";
    }

    /**
     * Resend OTP
     */
    public String resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if ("ACTIVE".equals(user.getStatus())) {
            throw new BadRequestException("Account is already active");
        }

        String otp = generateOtp();
        otpCache.put(user.getEmail(), otp);
        sendEmailOtp(user.getEmail(), otp);

        log.info("OTP resent to: {}", email);
        return "OTP resent successfully";
    }
}
