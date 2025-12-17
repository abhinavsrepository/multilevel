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

@Entity
@Table(name = "rank_settings", indexes = {
    @Index(name = "idx_rank_name", columnList = "rank_name", unique = true),
    @Index(name = "idx_rank_active", columnList = "is_active"),
    @Index(name = "idx_rank_display_order", columnList = "display_order")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RankSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rank_name", unique = true, nullable = false, length = 100)
    private String rankName;

    @Column(name = "required_direct_referrals", nullable = false)
    private Integer requiredDirectReferrals;

    @Column(name = "required_team_investment", nullable = false, precision = 15, scale = 2)
    private BigDecimal requiredTeamInvestment;

    @Column(name = "required_personal_investment", nullable = false, precision = 15, scale = 2)
    private BigDecimal requiredPersonalInvestment;

    @Column(name = "required_active_legs", nullable = false)
    private Integer requiredActiveLegs; // Binary leg concept

    @Column(name = "one_time_bonus", precision = 15, scale = 2)
    private BigDecimal oneTimeBonus;

    @Column(name = "monthly_leadership_bonus", precision = 15, scale = 2)
    private BigDecimal monthlyLeadershipBonus;

    @Column(name = "commission_boost_percent", precision = 5, scale = 2)
    private BigDecimal commissionBoostPercent;

    @Column(name = "benefits", columnDefinition = "jsonb")
    private String benefits; // JSON array of benefits

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
