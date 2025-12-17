package com.realestate.mlm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "kyc_documents", indexes = {
    @Index(name = "idx_kyc_user_id", columnList = "user_id"),
    @Index(name = "idx_kyc_status", columnList = "status"),
    @Index(name = "idx_kyc_document_type", columnList = "document_type"),
    @Index(name = "idx_kyc_document_number", columnList = "document_number"),
    @Index(name = "idx_kyc_created", columnList = "created_at"),
    @Index(name = "idx_kyc_user_status", columnList = "user_id,status")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KycDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType; // PAN, AADHAR, PASSPORT, DRIVING_LICENSE, VOTER_ID, etc.

    @Column(name = "document_number", nullable = false, length = 100)
    private String documentNumber;

    @Column(name = "document_file_url", columnDefinition = "text")
    private String documentFileUrl; // Full document scan

    @Column(name = "document_front_url", columnDefinition = "text")
    private String documentFrontUrl; // Front side of document

    @Column(name = "document_back_url", columnDefinition = "text")
    private String documentBackUrl; // Back side of document (if applicable)

    @Column(name = "status", nullable = false, length = 50)
    private String status; // PENDING, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, EXPIRED

    @Column(name = "remarks", columnDefinition = "text")
    private String remarks;

    @Column(name = "rejection_reason", columnDefinition = "text")
    private String rejectionReason;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
