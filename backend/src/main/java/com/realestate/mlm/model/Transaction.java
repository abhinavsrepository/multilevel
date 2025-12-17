package com.realestate.mlm.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "idx_transaction_id", columnList = "transaction_id", unique = true),
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_transaction_type", columnList = "type"),
        @Index(name = "idx_transaction_category", columnList = "category"),
        @Index(name = "idx_wallet_type", columnList = "wallet_type"),
        @Index(name = "idx_transaction_status", columnList = "status"),
        @Index(name = "idx_reference_id", columnList = "reference_id"),
        @Index(name = "idx_created_at", columnList = "created_at"),
        @Index(name = "idx_user_created", columnList = "user_id,created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", unique = true, nullable = false, length = 50)
    private String transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "type", nullable = false, length = 20)
    private String type; // CREDIT, DEBIT

    @Column(name = "category", nullable = false, length = 100)
    private String category; // COMMISSION, INVESTMENT, PAYOUT, REFUND, etc.

    @Column(name = "wallet_type", nullable = false, length = 50)
    private String walletType; // EARNING, BONUS, COMMISSION, INVESTMENT

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "balance_before", nullable = false, precision = 15, scale = 2)
    private BigDecimal balanceBefore;

    @Column(name = "balance_after", nullable = false, precision = 15, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "reference_id", length = 100)
    private String referenceId; // INVESTMENT_ID, COMMISSION_ID, etc.

    @Column(name = "reference_type", length = 50)
    private String referenceType; // INVESTMENT, COMMISSION, PAYOUT, etc.

    @Column(name = "status", nullable = false, length = 50)
    private String status; // SUCCESS, PENDING, FAILED, REVERSED

    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // BANK, UPI, WALLET, etc.

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "text")
    private String userAgent;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

}
