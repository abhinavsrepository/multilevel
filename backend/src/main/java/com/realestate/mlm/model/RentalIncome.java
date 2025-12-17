package com.realestate.mlm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Entity
@Table(name = "rental_income", indexes = {
    @Index(name = "idx_rental_property_id", columnList = "property_id"),
    @Index(name = "idx_rental_investment_id", columnList = "investment_id"),
    @Index(name = "idx_rental_user_id", columnList = "user_id"),
    @Index(name = "idx_rental_month", columnList = "month"),
    @Index(name = "idx_rental_status", columnList = "status"),
    @Index(name = "idx_rental_created", columnList = "created_at"),
    @Index(name = "idx_rental_property_month", columnList = "property_id,month")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalIncome {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "investment_id", nullable = false)
    private PropertyInvestment investment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // The investor receiving the rental income

    @Column(name = "month", nullable = false)
    private YearMonth month; // YYYY-MM format for the rental income period

    @Column(name = "rental_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal rentalAmount; // Total monthly rental amount of property

    @Column(name = "investor_share_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal investorSharePercent; // Investor's share percentage

    @Column(name = "investor_share_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal investorShareAmount; // Calculated share amount

    @Column(name = "maintenance_charges", precision = 15, scale = 2)
    private BigDecimal maintenanceCharges = BigDecimal.ZERO;

    @Column(name = "other_deductions", precision = 15, scale = 2)
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    @Column(name = "net_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal netAmount; // investorShareAmount - deductions

    @Column(name = "status", nullable = false, length = 50)
    private String status; // PENDING, CALCULATED, APPROVED, PAID, CANCELLED

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction; // Link to payout transaction

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
