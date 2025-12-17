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
public class TreeStatsResponse {
    private Integer totalTeam;
    private Integer leftLegCount;
    private Integer rightLegCount;
    private Integer activeMembers;
    private Integer inactiveMembers;
    private Integer directReferrals;
    private Integer directReferralsThisMonth;
    private BigDecimal teamBV;
    private BigDecimal leftBV;
    private BigDecimal rightBV;
    private BigDecimal matchingBV;
    private BigDecimal carryForward;
    private BigDecimal teamInvestment;
    private BigDecimal teamInvestmentThisMonth;
    private Integer maxDepth;
    private String placementStatus;
}
