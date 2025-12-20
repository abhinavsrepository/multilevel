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
public class DashboardStats {
    private BigDecimal totalInvestment;
    private BigDecimal totalEarnings;
    private BigDecimal availableBalance;
    private Integer teamSize;
    private Integer activeProperties;
    private BigDecimal todayIncome;
    private String currentRank;
    private Integer leftLeg;
    private Integer rightLeg;
    private String referralCode;
    private Double nextRankProgress;
}
