package com.realestate.mlm.controller;

import com.realestate.mlm.dto.request.TicketCreateRequest;
import com.realestate.mlm.dto.request.TicketReplyRequest;
import com.realestate.mlm.dto.response.ApiResponse;
import com.realestate.mlm.dto.response.PageResponse;
import com.realestate.mlm.dto.response.SupportTicketResponse;
import com.realestate.mlm.service.SupportTicketService;
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
 * REST controller for support ticket management
 */
@RestController
@RequestMapping("/tickets")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Support Ticket Management", description = "Customer support ticket creation and management endpoints")
@RequiredArgsConstructor
public class SupportTicketController {

        private final SupportTicketService supportTicketService;

        @Operation(summary = "Create support ticket", description = "Create a new support ticket")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Ticket created successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @PostMapping("/")
        public ResponseEntity<ApiResponse<SupportTicketResponse>> createTicket(
                        @Valid @RequestBody TicketCreateRequest request) {
                String userId = com.realestate.mlm.util.SecurityUtil.getCurrentUserMlmId();
                SupportTicketResponse ticket = supportTicketService.createTicket(request, userId);
                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(ApiResponse.<SupportTicketResponse>builder()
                                                .success(true)
                                                .message("Support ticket created successfully")
                                                .data(ticket)
                                                .build());
        }

        @Operation(summary = "Reply to ticket", description = "Reply to an existing support ticket")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Reply added successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - not your ticket"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data or ticket closed"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })

        @PostMapping("/{ticketId}/reply")
        public ResponseEntity<ApiResponse<String>> replyToTicket(
                        @Parameter(description = "Ticket ID") @PathVariable String ticketId,
                        @Valid @RequestBody TicketReplyRequest request) {
                // Ensure ticketId in request matches path variable
                request.setTicketId(ticketId);
                // Get current user ID
                String userId = com.realestate.mlm.util.SecurityUtil.getCurrentUserMlmId();

                supportTicketService.replyToTicket(request, userId);
                return ResponseEntity.ok(ApiResponse.<String>builder()
                                .success(true)
                                .message("Reply added successfully")
                                .data("Reply added successfully")
                                .build());
        }

        @Operation(summary = "Update ticket status", description = "Update support ticket status (Admin only)")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Ticket status updated successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Ticket not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid status"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @PreAuthorize("hasRole('ADMIN')")
        @PutMapping("/{ticketId}/status")
        public ResponseEntity<ApiResponse<String>> updateStatus(
                        @Parameter(description = "Ticket ID") @PathVariable String ticketId,
                        @Parameter(description = "New status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)") @RequestParam String status) {
                supportTicketService.updateTicketStatus(ticketId, status);
                return ResponseEntity.ok(ApiResponse.<String>builder()
                                .success(true)
                                .message("Ticket status updated successfully")
                                .data("Ticket status updated successfully")
                                .build());
        }
}
