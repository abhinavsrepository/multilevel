package com.realestate.mlm.service;

import com.realestate.mlm.dto.request.KycUploadRequest;
import com.realestate.mlm.dto.response.KycDocumentResponse;
import com.realestate.mlm.exception.BadRequestException;
import com.realestate.mlm.exception.ResourceNotFoundException;
import com.realestate.mlm.model.KycDocument;
import com.realestate.mlm.model.User;
import com.realestate.mlm.repository.KycDocumentRepository;
import com.realestate.mlm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycService {

    private final KycDocumentRepository kycDocumentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    /**
     * Upload KYC document
     */
    @Transactional
    public KycDocumentResponse uploadKycDocument(KycUploadRequest request, String userId) {
        log.info("Uploading KYC document for user: {}, type: {}", userId, request.getDocumentType());

        // Find user
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Validate file
        if (request.getFile() == null || request.getFile().isEmpty()) {
            throw new BadRequestException("Document file is required");
        }

        // Validate file type (images or PDF only)
        String[] allowedTypes = { "image", "pdf" };
        if (!fileStorageService.isValidFileType(request.getFile(), allowedTypes)) {
            throw new BadRequestException("Only image or PDF files are allowed");
        }

        // Validate file size (max 5MB)
        if (!fileStorageService.isValidFileSize(request.getFile(), 5)) {
            throw new BadRequestException("File size must not exceed 5MB");
        }

        // Check if document already exists for this type
        Optional<KycDocument> existingDoc = kycDocumentRepository
                .findByUserAndDocumentType(user, request.getDocumentType());

        if (existingDoc.isPresent()) {
            KycDocument existing = existingDoc.get();

            // If already approved, don't allow reupload
            if ("APPROVED".equals(existing.getStatus())) {
                throw new BadRequestException(String.format(
                        "%s already approved. Cannot upload again.",
                        request.getDocumentType()));
            }

            // If pending or rejected, update the existing document
            String fileUrl = fileStorageService.uploadFile(request.getFile(), "kyc");

            existing.setDocumentNumber(request.getDocumentNumber());
            existing.setDocumentFileUrl(fileUrl);
            existing.setStatus("SUBMITTED");
            existing.setRejectionReason(null);

            KycDocument updated = kycDocumentRepository.save(existing);

            log.info("KYC document updated for user: {}, type: {}", userId, request.getDocumentType());

            return mapToResponse(updated);
        }

        // Upload file to S3
        String fileUrl = fileStorageService.uploadFile(request.getFile(), "kyc");

        // Create KYC document record
        KycDocument kycDocument = new KycDocument();
        kycDocument.setUser(user);
        kycDocument.setDocumentType(request.getDocumentType());
        kycDocument.setDocumentNumber(request.getDocumentNumber());
        kycDocument.setDocumentFileUrl(fileUrl);
        kycDocument.setStatus("SUBMITTED");

        KycDocument savedDocument = kycDocumentRepository.save(kycDocument);

        // Update user KYC status
        if ("PENDING".equals(user.getKycStatus()) || "NONE".equals(user.getKycLevel())) {
            user.setKycStatus("SUBMITTED");
            userRepository.save(user);
        }

        // Send notification to admin
        notificationService.sendKycSubmittedNotification(user.getEmail(), user.getFullName());

        log.info("KYC document uploaded successfully for user: {}", userId);

        return mapToResponse(savedDocument);
    }

    /**
     * Get KYC documents for user
     */
    public List<KycDocumentResponse> getKycDocuments(String userId) {
        log.info("Fetching KYC documents for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        List<KycDocument> documents = kycDocumentRepository.findByUser(user);

        return documents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Approve KYC document (Admin)
     */
    @Transactional
    public KycDocumentResponse approveKyc(Long documentId, Long adminId) {
        log.info("Approving KYC document ID: {} by admin: {}", documentId, adminId);

        KycDocument document = kycDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC document not found with ID: " + documentId));

        // Validate status
        if ("APPROVED".equals(document.getStatus())) {
            throw new BadRequestException("Document is already approved");
        }

        // Update document status
        document.setStatus("APPROVED");
        document.setVerifiedBy("ADMIN_" + adminId);
        document.setVerifiedAt(LocalDateTime.now());

        KycDocument approvedDocument = kycDocumentRepository.save(document);

        // Update user KYC level
        updateKycLevel(document.getUser());

        // Send notification
        notificationService.sendKycApprovedNotification(
                document.getUser().getEmail(),
                document.getUser().getFullName(),
                document.getDocumentType());

        log.info("KYC document approved: {}", documentId);

        return mapToResponse(approvedDocument);
    }

    /**
     * Reject KYC document (Admin)
     */
    @Transactional
    public KycDocumentResponse rejectKyc(Long documentId, Long adminId, String reason) {
        log.info("Rejecting KYC document ID: {} by admin: {}, reason: {}", documentId, adminId, reason);

        KycDocument document = kycDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC document not found with ID: " + documentId));

        // Update document status
        document.setStatus("REJECTED");
        document.setRejectionReason(reason);
        document.setVerifiedBy("ADMIN_" + adminId);
        document.setVerifiedAt(LocalDateTime.now());

        KycDocument rejectedDocument = kycDocumentRepository.save(document);

        // Update user KYC status
        User user = document.getUser();
        List<KycDocument> userDocs = kycDocumentRepository.findByUser(user);

        boolean hasApproved = userDocs.stream()
                .anyMatch(d -> "APPROVED".equals(d.getStatus()));

        if (!hasApproved) {
            user.setKycStatus("REJECTED");
            userRepository.save(user);
        }

        // Send notification
        notificationService.sendKycRejectedNotification(
                user.getEmail(),
                user.getFullName(),
                document.getDocumentType(),
                reason);

        log.info("KYC document rejected: {}", documentId);

        return mapToResponse(rejectedDocument);
    }

    /**
     * Get pending KYC documents (Admin)
     */
    public Page<KycDocumentResponse> getPendingKycDocuments(Pageable pageable) {
        log.info("Fetching pending KYC documents");

        List<KycDocument> documents = kycDocumentRepository.findByStatus("SUBMITTED");

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), documents.size());

        List<KycDocumentResponse> responses = documents.subList(start, end).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, documents.size());
    }

    /**
     * Update user KYC level based on approved documents
     */
    @Transactional
    public void updateKycLevel(User user) {
        log.info("Updating KYC level for user: {}", user.getUserId());

        List<KycDocument> approvedDocs = kycDocumentRepository.findByUser(user).stream()
                .filter(d -> "APPROVED".equals(d.getStatus()))
                .collect(Collectors.toList());

        if (approvedDocs.isEmpty()) {
            user.setKycLevel("NONE");
            user.setKycStatus("PENDING");
        } else if (approvedDocs.size() == 1) {
            // Basic KYC - one document approved
            user.setKycLevel("BASIC");
            user.setKycStatus("BASIC");
        } else if (approvedDocs.size() == 2) {
            // Full KYC - two documents approved
            user.setKycLevel("FULL");
            user.setKycStatus("FULL");
        } else if (approvedDocs.size() >= 3) {
            // Premium KYC - three or more documents approved
            user.setKycLevel("PREMIUM");
            user.setKycStatus("PREMIUM");
        }

        userRepository.save(user);

        log.info("KYC level updated for user: {} to level: {}", user.getUserId(), user.getKycLevel());
    }

    /**
     * Map KycDocument to KycDocumentResponse
     */
    private KycDocumentResponse mapToResponse(KycDocument document) {
        return KycDocumentResponse.builder()
                .id(document.getId())
                .userId(document.getUser().getUserId())
                .userName(document.getUser().getFullName())
                .documentType(document.getDocumentType())
                .documentNumber(document.getDocumentNumber())
                .documentFileUrl(document.getDocumentFileUrl())
                .status(document.getStatus())
                .rejectionReason(document.getRejectionReason())
                .verifiedBy(document.getVerifiedBy())
                .verifiedAt(document.getVerifiedAt())
                .createdAt(document.getCreatedAt())
                .build();
    }

    /**
     * Get KYC status for user
     */
    public com.realestate.mlm.dto.response.KycStatusResponse getKycStatus(String userId) {
        log.info("Fetching KYC status for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        List<KycDocument> documents = kycDocumentRepository.findByUser(user);

        int totalUploaded = documents.size();
        int approved = (int) documents.stream().filter(d -> "APPROVED".equals(d.getStatus())).count();
        int pending = (int) documents.stream()
                .filter(d -> "SUBMITTED".equals(d.getStatus()) || "PENDING".equals(d.getStatus())).count();
        int rejected = (int) documents.stream().filter(d -> "REJECTED".equals(d.getStatus())).count();

        List<com.realestate.mlm.dto.response.KycStatusResponse.DocumentStatus> documentStatuses = documents.stream()
                .map(d -> com.realestate.mlm.dto.response.KycStatusResponse.DocumentStatus.builder()
                        .id(d.getId())
                        .documentType(d.getDocumentType())
                        .documentName(d.getDocumentType()) // Using type as name for now
                        .status(d.getStatus())
                        .uploadedAt(d.getCreatedAt())
                        .verifiedAt(d.getVerifiedAt())
                        .rejectionReason(d.getRejectionReason())
                        .build())
                .collect(Collectors.toList());

        // Determine required documents (simplified logic)
        List<String> requiredDocs = List.of("AADHAR", "PAN"); // Example requirements

        // Determine next steps
        String nextSteps = "Complete all required documents.";
        if (approved >= 2) {
            nextSteps = "KYC Verified. You can now proceed with transactions.";
        } else if (pending > 0) {
            nextSteps = "Wait for admin approval.";
        } else if (rejected > 0) {
            nextSteps = "Resubmit rejected documents.";
        }

        return com.realestate.mlm.dto.response.KycStatusResponse.builder()
                .overallStatus(user.getKycStatus())
                .kycLevel(user.getKycLevel())
                .isVerified("APPROVED".equals(user.getKycStatus()) || "FULL".equals(user.getKycLevel())
                        || "PREMIUM".equals(user.getKycLevel()))
                .lastUpdated(user.getUpdatedAt() != null ? user.getUpdatedAt() : LocalDateTime.now())
                .totalDocumentsUploaded(totalUploaded)
                .approvedDocuments(approved)
                .pendingDocuments(pending)
                .rejectedDocuments(rejected)
                .documents(documentStatuses)
                .nextSteps(nextSteps)
                .requiredDocuments(requiredDocs)
                .build();
    }
}
