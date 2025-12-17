package com.realestate.mlm.controller;

import com.realestate.mlm.dto.response.ApiResponse;
import com.realestate.mlm.dto.response.PageResponse;
import com.realestate.mlm.dto.response.TransactionResponse;
import com.realestate.mlm.dto.response.WalletResponse;
import com.realestate.mlm.dto.response.WalletSummaryResponse;
import com.realestate.mlm.service.WalletService;
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
 * REST controller for wallet and transaction operations
 */
@RestController
@RequestMapping("/wallet")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Wallet Management", description = "Wallet balance and transaction management endpoints")
public class WalletController {

    private final WalletService walletService;

    @Operation(summary = "Get wallet balance", description = "Get current user's wallet balance details")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Wallet balance retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<WalletResponse>> getBalance() {
        WalletResponse wallet = walletService.getWalletBalance();
        return ResponseEntity.ok(ApiResponse.<WalletResponse>builder()
                .success(true)
                .message("Wallet balance retrieved successfully")
                .data(wallet)
                .build());
    }

    @Operation(summary = "Get transactions", description = "Get paginated list of wallet transactions with optional filters")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Transactions retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/transactions")
    public ResponseEntity<PageResponse<TransactionResponse>> getTransactions(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
            @Parameter(description = "Filter by transaction type (CREDIT/DEBIT)") @RequestParam(required = false) String type,
            @Parameter(description = "Filter by category") @RequestParam(required = false) String category,
            @Parameter(description = "Filter by status") @RequestParam(required = false) String status,
            @Parameter(description = "Start date (yyyy-MM-dd)") @RequestParam(required = false) String startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") @RequestParam(required = false) String endDate) {

        PageResponse<TransactionResponse> transactions = walletService.getTransactions(
                pageable, type, category, status, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }

    @Operation(summary = "Get wallet summary", description = "Get comprehensive wallet summary with statistics")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Wallet summary retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<WalletSummaryResponse>> getSummary() {
        WalletSummaryResponse summary = walletService.getWalletSummary();
        return ResponseEntity.ok(ApiResponse.<WalletSummaryResponse>builder()
                .success(true)
                .message("Wallet summary retrieved successfully")
                .data(summary)
                .build());
    }
}
