package com.realestate.mlm.controller;

import com.realestate.mlm.dto.request.WithdrawalRequest;
import com.realestate.mlm.dto.response.ApiResponse;
import com.realestate.mlm.dto.response.PageResponse;
import com.realestate.mlm.dto.response.PayoutResponse;
import com.realestate.mlm.service.PayoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for payout/withdrawal operations
 */
@RestController
@RequestMapping("/payouts")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Payout Management", description = "Withdrawal and payout request management endpoints")
public class PayoutController {

    private final PayoutService payoutService;

    @Operation(summary = "Request withdrawal", description = "Request a withdrawal/payout from wallet balance")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Withdrawal request created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data or insufficient balance"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/request")
    public ResponseEntity<ApiResponse<PayoutResponse>> requestWithdrawal(
            @Valid @RequestBody WithdrawalRequest request) {
        PayoutResponse payout = payoutService.requestWithdrawal(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.<PayoutResponse>builder()
                        .success(true)
                        .message("Withdrawal request submitted successfully")
                        .data(payout)
                        .build());
    }

    @Operation(summary = "Get payout history", description = "Get paginated list of user's payout requests")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payout history retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/history")
    public ResponseEntity<PageResponse<PayoutResponse>> getHistory(
            @PageableDefault(size = 20, sort = "requestedAt") Pageable pageable) {
        PageResponse<PayoutResponse> payouts = payoutService.getPayoutHistory(pageable);
        return ResponseEntity.ok(payouts);
    }

    @Operation(summary = "Get payout details", description = "Get detailed information about a specific payout request")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payout details retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Payout not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - not your payout"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/{payoutId}")
    public ResponseEntity<ApiResponse<PayoutResponse>> getPayoutDetails(
            @Parameter(description = "Payout ID") @PathVariable String payoutId) {
        PayoutResponse payout = payoutService.getPayoutDetails(payoutId);
        return ResponseEntity.ok(ApiResponse.<PayoutResponse>builder()
                .success(true)
                .message("Payout details retrieved successfully")
                .data(payout)
                .build());
    }
}
