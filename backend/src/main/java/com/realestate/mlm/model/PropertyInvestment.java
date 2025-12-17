package com.realestate.mlm.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "property_investments", indexes = {
    @Index(name = "idx_investment_id", columnList = "investment_id", unique = true),
    @Index(name = "idx_investment_property_id", columnList = "property_id"),
    @Index(name = "idx_investment_user_id", columnList = "user_id"),
    @Index(name = "idx_investment_type", columnList = "investment_type"),
    @Index(name = "idx_investment_status", columnList = "investment_status"),
    @Index(name = "idx_booking_status", columnList = "booking_status"),
    @Index(name = "idx_commission_eligible", columnList = "commission_eligible"),
    @Index(name = "idx_investment_created", columnList = "created_at"),
    @Index(name = "idx_user_investment", columnList = "user_id,investment_status")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyInvestment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "investment_id", unique = true, nullable = false, length = 50)
    private String investmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "investment_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal investmentAmount;

    @Column(name = "bv_allocated", precision = 15, scale = 2)
    private BigDecimal bvAllocated; // Business Volume allocated

    @Column(name = "investment_type", nullable = false, length = 50)
    private String investmentType; // LUMP_SUM, INSTALLMENT

    // Installment Details
    @Column(name = "installment_plan", length = 100)
    private String installmentPlan; // e.g., "12 months", "24 months"

    @Column(name = "total_installments")
    private Integer totalInstallments;

    @Column(name = "installments_paid")
    private Integer installmentsPaid = 0;

    @Column(name = "installment_amount", precision = 15, scale = 2)
    private BigDecimal installmentAmount;

    @Column(name = "total_paid", precision = 15, scale = 2)
    private BigDecimal totalPaid = BigDecimal.ZERO;

    @Column(name = "pending_amount", precision = 15, scale = 2)
    private BigDecimal pendingAmount;

    @Column(name = "next_installment_date")
    private LocalDate nextInstallmentDate;

    // Payment Details
    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // BANK, UPI, CARD, WALLET, etc.

    @Column(name = "payment_gateway_ref", length = 100)
    private String paymentGatewayRef;

    // Commission Details
    @Column(name = "commission_eligible", nullable = false)
    private Boolean commissionEligible = true;

    @Column(name = "commissions_paid", precision = 15, scale = 2)
    private BigDecimal commissionsPaid = BigDecimal.ZERO;

    @Column(name = "commission_status", length = 50)
    private String commissionStatus; // PENDING, CREDITED, PAID, WITHHELD

    // Nominee Details
    @Column(name = "nominee_name", length = 255)
    private String nomineeName;

    @Column(name = "nominee_relation", length = 100)
    private String nomineeRelation;

    @Column(name = "nominee_contact", length = 20)
    private String nomineeContact;

    @Column(name = "nominee_dob")
    private LocalDate nomineeDob;

    // Agreement Details
    @Column(name = "agreement_number", unique = true, length = 100)
    private String agreementNumber;

    @Column(name = "agreement_date")
    private LocalDate agreementDate;

    @Column(name = "document_urls", columnDefinition = "jsonb")
    private String documentUrls; // JSON array of document URLs

    // Investment Status
    @Column(name = "investment_status", nullable = false, length = 50)
    private String investmentStatus; // ACTIVE, COMPLETED, MATURED, EXITED, CANCELLED

    @Column(name = "booking_status", nullable = false, length = 50)
    private String bookingStatus; // PROVISIONAL, CONFIRMED, CANCELLED

    @Column(name = "expected_maturity_date")
    private LocalDate expectedMaturityDate;

    @Column(name = "current_value", precision = 15, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "roi_earned", precision = 15, scale = 2)
    private BigDecimal roiEarned = BigDecimal.ZERO;

    @Column(name = "rental_income_earned", precision = 15, scale = 2)
    private BigDecimal rentalIncomeEarned = BigDecimal.ZERO;

    // Exit Details
    @Column(name = "exit_requested", nullable = false)
    private Boolean exitRequested = false;

    @Column(name = "exit_date")
    private LocalDate exitDate;

    @Column(name = "exit_amount", precision = 15, scale = 2)
    private BigDecimal exitAmount;

    @Column(name = "capital_gains", precision = 15, scale = 2)
    private BigDecimal capitalGains;

    // Lock-in Period
    @Column(name = "lock_in_period_months")
    private Integer lockInPeriodMonths;

    @Column(name = "lock_in_end_date")
    private LocalDate lockInEndDate;

    // Additional Fields
    @Column(name = "remarks", columnDefinition = "text")
    private String remarks;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
