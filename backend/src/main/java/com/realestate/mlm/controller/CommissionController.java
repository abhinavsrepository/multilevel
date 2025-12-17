package com.realestate.mlm.controller;

import com.realestate.mlm.dto.response.ApiResponse;
import com.realestate.mlm.dto.response.CommissionResponse;
import com.realestate.mlm.dto.response.CommissionSummaryResponse;
import com.realestate.mlm.dto.response.PageResponse;
import com.realestate.mlm.service.CommissionService;
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

import java.util.List;

/**
 * REST controller for commission tracking and management
 */
@RestController
@RequestMapping("/commissions")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Commission Management", description = "Commission tracking and statistics endpoints")
public class CommissionController {

    private final CommissionService commissionService;

    @Operation(summary = "Get commission history", description = "Get paginated list of user's commission earnings with optional filters")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Commission history retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/history")
    public ResponseEntity<PageResponse<CommissionResponse>> getHistory(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
            @Parameter(description = "Filter by commission type") @RequestParam(required = false) String type,
            @Parameter(description = "Filter by status") @RequestParam(required = false) String status,
            @Parameter(description = "Start date (yyyy-MM-dd)") @RequestParam(required = false) String startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") @RequestParam(required = false) String endDate) {

        PageResponse<CommissionResponse> commissions = commissionService.getCommissionHistory(
                pageable, type, status, startDate, endDate);
        return ResponseEntity.ok(commissions);
    }

    @Operation(summary = "Get commission summary", description = "Get comprehensive summary of user's commission earnings")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Commission summary retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<CommissionSummaryResponse>> getSummary() {
        CommissionSummaryResponse summary = commissionService.getCommissionSummary();
        return ResponseEntity.ok(ApiResponse.<CommissionSummaryResponse>builder()
                .success(true)
                .message("Commission summary retrieved successfully")
                .data(summary)
                .build());
    }

    @Operation(summary = "Get commissions by type", description = "Get all commissions of a specific type (e.g., DIRECT_REFERRAL, BINARY, LEVEL)")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Commissions retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid commission type"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/by-type/{type}")
    public ResponseEntity<ApiResponse<List<CommissionResponse>>> getByType(
            @Parameter(description = "Commission type (DIRECT_REFERRAL, BINARY, LEVEL, MATCHING, etc.)")
            @PathVariable String type) {
        List<CommissionResponse> commissions = commissionService.getCommissionsByType(type);
        return ResponseEntity.ok(ApiResponse.<List<CommissionResponse>>builder()
                .success(true)
                .message("Commissions retrieved successfully")
                .data(commissions)
                .build());
    }
}
