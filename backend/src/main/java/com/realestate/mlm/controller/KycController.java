package com.realestate.mlm.controller;

import com.realestate.mlm.dto.request.KycUploadRequest;
import com.realestate.mlm.dto.response.ApiResponse;
import com.realestate.mlm.dto.response.KycDocumentResponse;
import com.realestate.mlm.dto.response.KycStatusResponse;
import com.realestate.mlm.service.KycService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST controller for KYC (Know Your Customer) document management
 */
@RestController
@RequestMapping("/kyc")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "KYC Management", description = "KYC document upload and verification endpoints")
public class KycController {

        private final KycService kycService;

        @Operation(summary = "Upload KYC document", description = "Upload a KYC document (ID proof, address proof, etc.)")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Document uploaded successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file or request data"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<String>> uploadDocument(
                        @Parameter(description = "Document file (PDF, JPG, PNG - max 5MB)") @RequestParam MultipartFile file,
                        @Valid @ModelAttribute KycUploadRequest request) {

                String userId = com.realestate.mlm.util.SecurityUtil.getCurrentUserMlmId();
                request.setFile(file);

                KycDocumentResponse response = kycService.uploadKycDocument(request, userId);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(ApiResponse.<String>builder()
                                                .success(true)
                                                .message("Document uploaded successfully")
                                                .data("KYC document uploaded successfully. Status: "
                                                                + response.getStatus())
                                                .build());
        }

        @Operation(summary = "Get KYC documents", description = "Get list of all KYC documents uploaded by current user")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Documents retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @GetMapping("/documents")
        public ResponseEntity<ApiResponse<List<KycDocumentResponse>>> getDocuments() {
                String userId = com.realestate.mlm.util.SecurityUtil.getCurrentUserMlmId();
                List<KycDocumentResponse> documents = kycService.getKycDocuments(userId);
                return ResponseEntity.ok(ApiResponse.<List<KycDocumentResponse>>builder()
                                .success(true)
                                .message("KYC documents retrieved successfully")
                                .data(documents)
                                .build());
        }

        @Operation(summary = "Get KYC status", description = "Get current user's overall KYC verification status")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "KYC status retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @GetMapping("/status")
        public ResponseEntity<ApiResponse<KycStatusResponse>> getKycStatus() {
                String userId = com.realestate.mlm.util.SecurityUtil.getCurrentUserMlmId();
                KycStatusResponse status = kycService.getKycStatus(userId);
                return ResponseEntity.ok(ApiResponse.<KycStatusResponse>builder()
                                .success(true)
                                .message("KYC status retrieved successfully")
                                .data(status)
                                .build());
        }
}
