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
public class CommissionSummaryResponse {
    private BigDecimal totalEarnings;
    private BigDecimal thisMonthEarnings;
    private BigDecimal todayEarnings;
    private BigDecimal pendingCommissions;
    private BigDecimal paidCommissions;
    private Integer totalCommissionCount;
    private List<CommissionByType> byType;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommissionByType {
        private String type;
        private String typeName;
        private BigDecimal totalEarned;
        private BigDecimal thisMonth;
        private Integer count;
        private BigDecimal percentage;
    }
}
