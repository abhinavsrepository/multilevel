package com.realestate.mlm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private BigDecimal totalInvestment;
    private BigDecimal totalEarnings;
    private BigDecimal totalWithdrawn;
    private BigDecimal availableBalance;
    private Integer teamCount;
    private Integer leftTeamCount;
    private Integer rightTeamCount;
    private Integer activeProperties;
    private Integer pendingPayouts;
    private BigDecimal todayIncome;
    private BigDecimal thisMonthIncome;
    private String rank;
    private List<ActivityResponse> recentActivities;
}
