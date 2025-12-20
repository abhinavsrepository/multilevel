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
public class PortfolioDistributionData {
    private String propertyType;
    private BigDecimal currentValue;
    private BigDecimal invested;
    private Integer count;
    private String color;
}
