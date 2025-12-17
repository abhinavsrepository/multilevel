package com.realestate.mlm.controller;

import com.realestate.mlm.dto.response.ApiResponse;
import com.realestate.mlm.dto.response.TreeNodeResponse;
import com.realestate.mlm.dto.response.TreeStatsResponse;
import com.realestate.mlm.service.TreeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.realestate.mlm.util.SecurityUtil;

/**
 * REST controller for binary tree visualization and statistics
 */
@RestController
@RequestMapping("/tree")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Binary Tree", description = "Binary tree visualization and statistics endpoints")
public class TreeController {

        private final TreeService treeService;

        @Operation(summary = "Get binary tree", description = "Get binary tree structure for a user with specified depth")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Binary tree retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @GetMapping("/binary")
        public ResponseEntity<ApiResponse<TreeNodeResponse>> getBinaryTree(
                        @Parameter(description = "User ID (default: current user)") @RequestParam(required = false) String userId,
                        @Parameter(description = "Tree depth to retrieve (default: 3, max: 10)") @RequestParam(defaultValue = "3") int depth) {

                if (userId == null) {
                        userId = SecurityUtil.getCurrentUserMlmId();
                }

                TreeNodeResponse tree = treeService.getBinaryTree(userId, depth);
                return ResponseEntity.ok(ApiResponse.<TreeNodeResponse>builder()
                                .success(true)
                                .message("Binary tree retrieved successfully")
                                .data(tree)
                                .build());
        }

        @Operation(summary = "Get tree statistics", description = "Get comprehensive statistics about user's binary tree")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tree statistics retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @GetMapping("/stats")
        public ResponseEntity<ApiResponse<TreeStatsResponse>> getTreeStats() {
                String userId = SecurityUtil.getCurrentUserMlmId();
                TreeStatsResponse stats = treeService.getTreeStats(userId);
                return ResponseEntity.ok(ApiResponse.<TreeStatsResponse>builder()
                                .success(true)
                                .message("Tree statistics retrieved successfully")
                                .data(stats)
                                .build());
        }
}
