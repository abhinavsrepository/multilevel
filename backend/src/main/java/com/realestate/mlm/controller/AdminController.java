package com.realestate.mlm.controller;

import com.realestate.mlm.dto.response.*;
import com.realestate.mlm.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for admin operations
 */
@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Management", description = "Admin operations for user, payout, and KYC management")
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "Get all users", description = "Get paginated list of all registered users")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @GetMapping("/users")
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        PageResponse<UserResponse> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Activate user", description = "Activate a blocked or inactive user account")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User activated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @PutMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse<String>> activateUser(
            @Parameter(description = "User ID") @PathVariable Long id) {
        String message = adminService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message(message)
                .data("User activated successfully")
                .build());
    }

    @Operation(summary = "Block user", description = "Block a user account")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User blocked successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @PutMapping("/users/{id}/block")
    public ResponseEntity<ApiResponse<String>> blockUser(
            @Parameter(description = "User ID") @PathVariable Long id) {
        String message = adminService.blockUser(id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message(message)
                .data("User blocked successfully")
                .build());
    }

    @Operation(summary = "Get admin dashboard", description = "Get admin dashboard with overall system statistics")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Dashboard data retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        AdminDashboardResponse dashboard = adminService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.<AdminDashboardResponse>builder()
                .success(true)
                .message("Admin dashboard data retrieved successfully")
                .data(dashboard)
                .build());
    }

    @Operation(summary = "Get pending payouts", description = "Get paginated list of pending payout requests")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Pending payouts retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @GetMapping("/payouts/pending")
    public ResponseEntity<PageResponse<PayoutResponse>> getPendingPayouts(
            @PageableDefault(size = 20, sort = "requestedAt") Pageable pageable) {
        PageResponse<PayoutResponse> payouts = adminService.getPendingPayouts(pageable);
        return ResponseEntity.ok(payouts);
    }

    @Operation(summary = "Approve payout", description = "Approve a pending payout request")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payout approved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Payout not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Payout already processed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @PutMapping("/payouts/{payoutId}/approve")
    public ResponseEntity<ApiResponse<String>> approvePayout(
            @Parameter(description = "Payout ID") @PathVariable String payoutId) {
        String message = adminService.approvePayout(payoutId);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message(message)
                .data("Payout approved successfully")
                .build());
    }

    @Operation(summary = "Reject payout", description = "Reject a pending payout request with reason")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payout rejected successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Payout not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Payout already processed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @PutMapping("/payouts/{payoutId}/reject")
    public ResponseEntity<ApiResponse<String>> rejectPayout(
            @Parameter(description = "Payout ID") @PathVariable String payoutId,
            @Parameter(description = "Rejection reason") @RequestParam String reason) {
        String message = adminService.rejectPayout(payoutId, reason);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message(message)
                .data("Payout rejected successfully")
                .build());
    }

    @Operation(summary = "Get pending KYC", description = "Get paginated list of pending KYC documents")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Pending KYC documents retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @GetMapping("/kyc/pending")
    public ResponseEntity<PageResponse<KycDocumentResponse>> getPendingKyc(
            @PageableDefault(size = 20, sort = "uploadedAt") Pageable pageable) {
        PageResponse<KycDocumentResponse> kycDocuments = adminService.getPendingKyc(pageable);
        return ResponseEntity.ok(kycDocuments);
    }

    @Operation(summary = "Approve KYC", description = "Approve a pending KYC document")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "KYC approved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "KYC document not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "KYC already processed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @PutMapping("/kyc/{id}/approve")
    public ResponseEntity<ApiResponse<String>> approveKyc(
            @Parameter(description = "KYC document ID") @PathVariable Long id) {
        String message = adminService.approveKyc(id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message(message)
                .data("KYC approved successfully")
                .build());
    }

    @Operation(summary = "Reject KYC", description = "Reject a pending KYC document with reason")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "KYC rejected successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "KYC document not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "KYC already processed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @PutMapping("/kyc/{id}/reject")
    public ResponseEntity<ApiResponse<String>> rejectKyc(
            @Parameter(description = "KYC document ID") @PathVariable Long id,
            @Parameter(description = "Rejection reason") @RequestParam String reason) {
        String message = adminService.rejectKyc(id, reason);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message(message)
                .data("KYC rejected successfully")
                .build());
    }
}
