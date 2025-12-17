package com.realestate.mlm.controller;

import com.realestate.mlm.dto.request.InstallmentPaymentRequest;
import com.realestate.mlm.dto.request.PropertyInvestmentRequest;
import com.realestate.mlm.dto.response.ApiResponse;
import com.realestate.mlm.dto.response.PageResponse;
import com.realestate.mlm.dto.response.PortfolioSummaryResponse;
import com.realestate.mlm.dto.response.PropertyInvestmentResponse;
import com.realestate.mlm.service.InvestmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.realestate.mlm.util.SecurityUtil;

/**
 * REST controller for property investment operations
 */
@RestController
@RequestMapping("/investments")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Investment Management", description = "Property investment and portfolio management endpoints")
public class InvestmentController {

        private final InvestmentService investmentService;

        @Operation(summary = "Create investment", description = "Create a new property investment")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Investment created successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data or insufficient balance"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Property not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @PostMapping("/")
        public ResponseEntity<ApiResponse<PropertyInvestmentResponse>> createInvestment(
                        @Valid @RequestBody PropertyInvestmentRequest request) {
                PropertyInvestmentResponse investment = investmentService.createInvestment(request,
                                SecurityUtil.getCurrentUserMlmId());
                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(ApiResponse.<PropertyInvestmentResponse>builder()
                                                .success(true)
                                                .message("Investment created successfully")
                                                .data(investment)
                                                .build());
        }

        @Operation(summary = "Get my investments", description = "Get paginated list of current user's investments")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Investments retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @GetMapping("/my-investments")
        public ResponseEntity<PageResponse<PropertyInvestmentResponse>> getMyInvestments(
                        @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
                Page<PropertyInvestmentResponse> page = investmentService
                                .getMyInvestments(SecurityUtil.getCurrentUserMlmId(), pageable);

                PageResponse<PropertyInvestmentResponse> response = PageResponse.<PropertyInvestmentResponse>builder()
                                .content(page.getContent())
                                .page(page.getNumber())
                                .size(page.getSize())
                                .totalElements(page.getTotalElements())
                                .totalPages(page.getTotalPages())
                                .first(page.isFirst())
                                .last(page.isLast())
                                .build();

                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Get investment details", description = "Get detailed information about a specific investment")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Investment details retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Investment not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - not your investment"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<PropertyInvestmentResponse>> getInvestmentDetails(
                        @Parameter(description = "Investment ID") @PathVariable Long id) {
                PropertyInvestmentResponse investment = investmentService.getInvestmentDetails(id,
                                SecurityUtil.getCurrentUserMlmId());
                return ResponseEntity.ok(ApiResponse.<PropertyInvestmentResponse>builder()
                                .success(true)
                                .message("Investment details retrieved successfully")
                                .data(investment)
                                .build());
        }

        @Operation(summary = "Get portfolio summary", description = "Get current user's investment portfolio summary")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Portfolio summary retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @GetMapping("/portfolio")
        public ResponseEntity<ApiResponse<PortfolioSummaryResponse>> getPortfolioSummary() {
                PortfolioSummaryResponse summary = investmentService
                                .getPortfolioSummary(SecurityUtil.getCurrentUserMlmId());
                return ResponseEntity.ok(ApiResponse.<PortfolioSummaryResponse>builder()
                                .success(true)
                                .message("Portfolio summary retrieved successfully")
                                .data(summary)
                                .build());
        }

        @Operation(summary = "Request investment exit", description = "Request to exit from an active investment")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Exit request submitted successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Investment not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request or lock-in period not over"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @PostMapping("/{id}/exit")
        public ResponseEntity<ApiResponse<String>> requestExit(
                        @Parameter(description = "Investment ID") @PathVariable Long id) {
                String message = investmentService.requestExit(id, SecurityUtil.getCurrentUserMlmId());
                return ResponseEntity.ok(ApiResponse.<String>builder()
                                .success(true)
                                .message(message)
                                .data("Exit request submitted successfully")
                                .build());
        }
}
