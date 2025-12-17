package com.realestate.mlm.controller;

import com.realestate.mlm.dto.request.*;
import com.realestate.mlm.dto.response.ApiResponse;
import com.realestate.mlm.dto.response.AuthResponse;
import com.realestate.mlm.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication operations
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class AuthController {

        private final AuthService authService;

        @Operation(summary = "Register new user", description = "Register a new user with referral code")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "User already exists")
        })
        @PostMapping("/register")
        public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
                AuthResponse response = authService.register(request);
                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(ApiResponse.<AuthResponse>builder()
                                                .success(true)
                                                .message("Registration successful. Please verify your account with OTP sent to your email/mobile.")
                                                .data(response)
                                                .build());
        }

        @Operation(summary = "User login", description = "Authenticate user with email/mobile and password")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Account not verified or blocked")
        })
        @PostMapping("/login")
        public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
                AuthResponse response = authService.login(request);
                return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                                .success(true)
                                .message("Login successful")
                                .data(response)
                                .build());
        }

        @Operation(summary = "Verify OTP", description = "Verify OTP sent to email/mobile during registration or password reset")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OTP verified successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired OTP")
        })
        @PostMapping("/verify-otp")
        public ResponseEntity<ApiResponse<String>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
                String message = authService.verifyOtp(request);
                return ResponseEntity.ok(ApiResponse.<String>builder()
                                .success(true)
                                .message(message)
                                .data("OTP verified successfully")
                                .build());
        }

        @Operation(summary = "Resend OTP", description = "Resend OTP to user's email or mobile number")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OTP resent successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
        })
        @PostMapping("/resend-otp")
        public ResponseEntity<ApiResponse<String>> resendOtp(@RequestParam String emailOrMobile) {
                String message = authService.resendOtp(emailOrMobile);
                return ResponseEntity.ok(ApiResponse.<String>builder()
                                .success(true)
                                .message(message)
                                .data("OTP sent successfully")
                                .build());
        }

        @Operation(summary = "Forgot password", description = "Request password reset link/OTP")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password reset OTP sent"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
        })
        @PostMapping("/forgot-password")
        public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestParam String email) {
                String message = authService.forgotPassword(email);
                return ResponseEntity.ok(ApiResponse.<String>builder()
                                .success(true)
                                .message(message)
                                .data("Password reset OTP sent to your email")
                                .build());
        }

        @Operation(summary = "Reset password", description = "Reset password using OTP and new password")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password reset successful"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid OTP or request")
        })
        @PostMapping("/reset-password")
        public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
                String message = authService.resetPassword(request);
                return ResponseEntity.ok(ApiResponse.<String>builder()
                                .success(true)
                                .message(message)
                                .data("Password reset successfully")
                                .build());
        }

        @Operation(summary = "Refresh access token", description = "Get new access token using refresh token")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
        })
        @PostMapping("/refresh-token")
        public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
                        @RequestHeader("Refresh-Token") String refreshToken) {
                AuthResponse response = authService.refreshToken(refreshToken);
                return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                                .success(true)
                                .message("Token refreshed successfully")
                                .data(response)
                                .build());
        }

        @Operation(summary = "Logout", description = "Logout current user and invalidate tokens")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logout successful")
        })
        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<String>> logout(@RequestHeader("Refresh-Token") String refreshToken) {
                authService.logout(refreshToken);
                return ResponseEntity.ok(ApiResponse.<String>builder()
                                .success(true)
                                .message("Logout successful")
                                .data("User logged out successfully")
                                .build());
        }
}
