package com.realestate.mlm.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "commissions", indexes = {
    @Index(name = "idx_commission_id", columnList = "commission_id", unique = true),
    @Index(name = "idx_commission_user_id", columnList = "user_id"),
    @Index(name = "idx_commission_from_user_id", columnList = "from_user_id"),
    @Index(name = "idx_commission_type", columnList = "commission_type"),
    @Index(name = "idx_commission_level", columnList = "level"),
    @Index(name = "idx_property_id", columnList = "property_id"),
    @Index(name = "idx_investment_id", columnList = "investment_id"),
    @Index(name = "idx_commission_status", columnList = "status"),
    @Index(name = "idx_commission_created", columnList = "created_at"),
    @Index(name = "idx_user_status", columnList = "user_id,status")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Commission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "commission_id", unique = true, nullable = false, length = 50)
    private String commissionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Commission earned by this user

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_user_id")
    private User fromUser; // Commission earned from this user's referral

    @Column(name = "commission_type", nullable = false, length = 50)
    private String commissionType; // DIRECT_REFERRAL, LEVEL_2, LEVEL_3, MATCHING, BV_BASED, etc.

    @Column(name = "level", nullable = false)
    private Integer level; // 1 for direct, 2 for level 2, etc.

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "percentage", precision = 5, scale = 2)
    private BigDecimal percentage; // Commission percentage if applicable

    @Column(name = "base_amount", precision = 15, scale = 2)
    private BigDecimal baseAmount; // Base amount on which commission was calculated

    @Column(name = "property_id", length = 50)
    private String propertyId; // Associated property

    @Column(name = "investment_id", length = 50)
    private String investmentId; // Associated investment

    @Column(name = "business_volume", precision = 15, scale = 2)
    private BigDecimal businessVolume; // BV generated

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "calculation_details", columnDefinition = "jsonb")
    private String calculationDetails; // JSON object with calculation breakdown

    @Column(name = "status", nullable = false, length = 50)
    private String status; // EARNED, CREDITED, PAID, REVERSED

    @Column(name = "cap_applied", nullable = false)
    private Boolean capApplied = false; // Whether income cap was applied

    @Column(name = "capped_amount", precision = 15, scale = 2)
    private BigDecimal cappedAmount; // Amount after cap application if any

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "transaction_id", length = 50)
    private String transactionId; // Associated transaction ID

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

}
