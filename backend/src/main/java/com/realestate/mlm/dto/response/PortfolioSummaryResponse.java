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
public class PortfolioSummaryResponse {
    private BigDecimal totalInvestment;
    private BigDecimal currentValue;
    private BigDecimal totalAppreciation;
    private BigDecimal appreciationPercentage;
    private Integer totalProperties;
    private Integer activeInvestments;
    private BigDecimal totalReturns;
    private BigDecimal roiEarned;
    private BigDecimal rentalIncome;
    private BigDecimal capitalAppreciation;
    private BigDecimal returnsRate;
    private List<PropertyPerformance> topPerformingProperties;
    private List<AssetAllocation> assetAllocation;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PropertyPerformance {
        private Long propertyId;
        private String propertyName;
        private String propertyType;
        private BigDecimal invested;
        private BigDecimal currentValue;
        private BigDecimal appreciation;
        private BigDecimal appreciationPercentage;
        private BigDecimal roiEarned;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssetAllocation {
        private String propertyType;
        private BigDecimal percentage;
        private BigDecimal value;
        private Integer count;
    }
}
