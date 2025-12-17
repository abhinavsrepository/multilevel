package com.realestate.mlm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyInvestmentResponse {
    private Long investmentId;
    private PropertyResponse property;
    private BigDecimal investmentAmount;
    private String investmentType;
    private String installmentPlan;
    private Integer totalInstallments;
    private Integer installmentsPaid;
    private BigDecimal totalPaid;
    private BigDecimal pendingAmount;
    private String investmentStatus;
    private BigDecimal roiEarned;
    private BigDecimal currentValue;
    private LocalDateTime createdAt;
}
