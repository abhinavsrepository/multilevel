package com.realestate.mlm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email"),
    @Index(name = "idx_users_mobile", columnList = "mobile"),
    @Index(name = "idx_users_user_id", columnList = "userId"),
    @Index(name = "idx_users_sponsor", columnList = "sponsorId"),
    @Index(name = "idx_users_status", columnList = "status"),
    @Index(name = "idx_users_placement", columnList = "placementUserId, placement")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String userId;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(unique = true, nullable = false, length = 15)
    private String mobile;

    @Column(nullable = false)
    private String password;

    private LocalDate dateOfBirth;

    @Column(length = 10)
    private String gender;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 50)
    private String city;

    @Column(length = 50)
    private String state;

    @Column(length = 10)
    private String pincode;

    @Column(length = 50)
    private String country = "India";

    // MLM Tree Structure
    @Column(length = 20)
    private String sponsorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sponsor_user_id")
    private User sponsor;

    @Column(length = 10)
    private String placement; // LEFT, RIGHT, AUTO

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "placement_user_id")
    private User placementUser;

    @Column(nullable = false)
    private Integer level = 0;

    @Column(precision = 15, scale = 2)
    private BigDecimal leftBv = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal rightBv = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal carryForwardLeft = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal carryForwardRight = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal personalBv = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal teamBv = BigDecimal.ZERO;

    // Financial Tracking
    @Column(precision = 15, scale = 2)
    private BigDecimal totalInvestment = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalEarnings = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalWithdrawn = BigDecimal.ZERO;

    // Rank & Status
    @Column(length = 50)
    private String rank = "Associate";

    private LocalDateTime rankAchievedDate;

    @Column(length = 20)
    private String status = "PENDING"; // PENDING, ACTIVE, BLOCKED, INACTIVE

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Role role = Role.MEMBER;

    public enum Role {
        ADMIN, MANAGER, MEMBER, FRANCHISE
    }

    // Verification
    @Column(nullable = false)
    private Boolean emailVerified = false;

    @Column(nullable = false)
    private Boolean mobileVerified = false;

    @Column(length = 20)
    private String kycStatus = "PENDING"; // PENDING, BASIC, FULL, PREMIUM, REJECTED

    @Column(length = 20)
    private String kycLevel = "NONE"; // BASIC, FULL, PREMIUM

    // Activation & Login
    private LocalDateTime activationDate;

    private LocalDateTime lastLoginAt;

    @Column(length = 50)
    private String lastLoginIp;

    @Column(unique = true, length = 20)
    private String referralCode;

    private String profilePicture;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Helper Methods
    public boolean isActive() {
        return "ACTIVE".equals(this.status);
    }

    public boolean isKycVerified() {
        return "FULL".equals(this.kycLevel) || "PREMIUM".equals(this.kycLevel);
    }

    public BigDecimal getAvailableBalance() {
        return totalEarnings.subtract(totalWithdrawn);
    }
}
