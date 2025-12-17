package com.realestate.mlm.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payouts", indexes = {
    @Index(name = "idx_payout_id", columnList = "payout_id", unique = true),
    @Index(name = "idx_payout_user_id", columnList = "user_id"),
    @Index(name = "idx_payout_status", columnList = "status"),
    @Index(name = "idx_payout_method", columnList = "payment_method"),
    @Index(name = "idx_payout_requested", columnList = "requested_at"),
    @Index(name = "idx_payout_processed", columnList = "processed_at"),
    @Index(name = "idx_user_status", columnList = "user_id,status"),
    @Index(name = "idx_transaction_id", columnList = "transaction_id")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payout_id", unique = true, nullable = false, length = 50)
    private String payoutId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "requested_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal requestedAmount;

    @Column(name = "tds_amount", precision = 15, scale = 2)
    private BigDecimal tdsAmount = BigDecimal.ZERO;

    @Column(name = "admin_charge", precision = 15, scale = 2)
    private BigDecimal adminCharge = BigDecimal.ZERO;

    @Column(name = "net_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal netAmount;

    // Bank Details
    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(name = "ifsc_code", length = 20)
    private String ifscCode;

    @Column(name = "account_holder_name", length = 255)
    private String accountHolderName;

    @Column(name = "branch_name", length = 150)
    private String branchName;

    // UPI Details
    @Column(name = "upi_id", length = 100)
    private String upiId;

    // Payment Method
    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod; // BANK, UPI, WALLET

    // Status
    @Column(name = "status", nullable = false, length = 50)
    private String status; // REQUESTED, APPROVED, PROCESSED, COMPLETED, REJECTED, CANCELLED

    // Remarks and Reasons
    @Column(name = "remarks", columnDefinition = "text")
    private String remarks;

    @Column(name = "rejection_reason", columnDefinition = "text")
    private String rejectionReason;

    // Payment Reference
    @Column(name = "payment_proof_url", length = 500)
    private String paymentProofUrl;

    @Column(name = "payment_gateway_ref", length = 100)
    private String paymentGatewayRef;

    @Column(name = "utr_number", length = 100)
    private String utrNumber; // Unique Transaction Reference for bank transfers

    // Status Timestamps
    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Approval Information
    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "processed_by", length = 100)
    private String processedBy;

    // Transaction Reference
    @Column(name = "transaction_id", length = 50)
    private String transactionId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
