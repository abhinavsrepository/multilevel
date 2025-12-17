package com.realestate.mlm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private Long totalUsers;
    private Long activeUsers;
    private Long inactiveUsers;
    private Long newUsersToday;
    private Long newUsersThisMonth;
    private BigDecimal totalInvestments;
    private BigDecimal totalInvestmentsThisMonth;
    private BigDecimal totalCommissionsPaid;
    private BigDecimal totalCommissionsThisMonth;
    private Long totalProperties;
    private Long activeProperties;
    private Long pendingPayouts;
    private BigDecimal pendingPayoutAmount;
    private Long pendingKycDocuments;
    private Long pendingSupportTickets;
    private BigDecimal totalWalletBalance;
    private BigDecimal platformRevenue;
}
