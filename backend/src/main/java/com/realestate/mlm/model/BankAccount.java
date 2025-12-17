package com.realestate.mlm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "bank_accounts", indexes = {
    @Index(name = "idx_bank_user_id", columnList = "user_id"),
    @Index(name = "idx_bank_account_number", columnList = "account_number"),
    @Index(name = "idx_bank_primary", columnList = "user_id,is_primary"),
    @Index(name = "idx_bank_verified", columnList = "is_verified"),
    @Index(name = "idx_bank_created", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;

    @Column(name = "account_number", nullable = false, length = 50)
    private String accountNumber;

    @Column(name = "ifsc_code", nullable = false, length = 11)
    private String ifscCode;

    @Column(name = "account_holder_name", nullable = false, length = 100)
    private String accountHolderName;

    @Column(name = "branch_name", length = 100)
    private String branchName;

    @Column(name = "account_type", length = 50)
    private String accountType; // SAVINGS, CURRENT, CHECKING

    @Column(name = "upi_id", length = 100)
    private String upiId;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "verification_method", length = 50)
    private String verificationMethod; // MICRO_DEPOSIT, DOCUMENT, INSTANT, MANUAL

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
