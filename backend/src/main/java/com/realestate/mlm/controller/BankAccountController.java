package com.realestate.mlm.controller;

import com.realestate.mlm.dto.request.BankAccountRequest;
import com.realestate.mlm.dto.response.ApiResponse;
import com.realestate.mlm.dto.response.BankAccountResponse;
import com.realestate.mlm.service.BankAccountService;
import com.realestate.mlm.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for bank account management
 */
@RestController
@RequestMapping("/bank-accounts")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Bank Account Management", description = "Bank account registration and management endpoints")
public class BankAccountController {

        private final BankAccountService bankAccountService;

        @Operation(summary = "Add bank account", description = "Register a new bank account for withdrawals")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Bank account added successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Bank account already exists"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @PostMapping("/")
        public ResponseEntity<ApiResponse<BankAccountResponse>> addBankAccount(
                        @Valid @RequestBody BankAccountRequest request) {
                String userId = SecurityUtil.getCurrentUserMlmId();
                BankAccountResponse bankAccount = bankAccountService.addBankAccount(request, userId);
                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(ApiResponse.<BankAccountResponse>builder()
                                                .success(true)
                                                .message("Bank account added successfully")
                                                .data(bankAccount)
                                                .build());
        }

        @Operation(summary = "Get bank accounts", description = "Get list of all bank accounts registered by current user")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bank accounts retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @GetMapping("/")
        public ResponseEntity<ApiResponse<List<BankAccountResponse>>> getBankAccounts() {
                String userId = SecurityUtil.getCurrentUserMlmId();
                List<BankAccountResponse> accounts = bankAccountService.getBankAccounts(userId);
                return ResponseEntity.ok(ApiResponse.<List<BankAccountResponse>>builder()
                                .success(true)
                                .message("Bank accounts retrieved successfully")
                                .data(accounts)
                                .build());
        }

        @Operation(summary = "Update bank account", description = "Update an existing bank account details")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bank account updated successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Bank account not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - not your bank account"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<BankAccountResponse>> updateBankAccount(
                        @Parameter(description = "Bank account ID") @PathVariable Long id,
                        @Valid @RequestBody BankAccountRequest request) {
                String userId = SecurityUtil.getCurrentUserMlmId();
                BankAccountResponse bankAccount = bankAccountService.updateBankAccount(id, request, userId);
                return ResponseEntity.ok(ApiResponse.<BankAccountResponse>builder()
                                .success(true)
                                .message("Bank account updated successfully")
                                .data(bankAccount)
                                .build());
        }

        @Operation(summary = "Delete bank account", description = "Delete a bank account")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bank account deleted successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Bank account not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - not your bank account"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Cannot delete primary bank account"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<String>> deleteBankAccount(
                        @Parameter(description = "Bank account ID") @PathVariable Long id) {
                String userId = SecurityUtil.getCurrentUserMlmId();
                bankAccountService.deleteBankAccount(id, userId);
                return ResponseEntity.ok(ApiResponse.<String>builder()
                                .success(true)
                                .message("Bank account deleted successfully")
                                .data("Bank account deleted successfully")
                                .build());
        }

        @Operation(summary = "Set primary account", description = "Set a bank account as the primary account for withdrawals")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Primary account set successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Bank account not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - not your bank account"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @PutMapping("/{id}/set-primary")
        public ResponseEntity<ApiResponse<BankAccountResponse>> setPrimaryAccount(
                        @Parameter(description = "Bank account ID") @PathVariable Long id) {
                String userId = SecurityUtil.getCurrentUserMlmId();
                BankAccountResponse bankAccount = bankAccountService.setPrimaryAccount(id, userId);
                return ResponseEntity.ok(ApiResponse.<BankAccountResponse>builder()
                                .success(true)
                                .message("Primary account set successfully")
                                .data(bankAccount)
                                .build());
        }
}
