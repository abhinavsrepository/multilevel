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
public class CommissionResponse {
    private Long commissionId;
    private String commissionType;
    private BigDecimal amount;
    private BigDecimal percentage;
    private BigDecimal baseAmount;
    private Integer level;
    private String description;
    private String status;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
