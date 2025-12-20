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
public class EarningsTrendData {
    private String date;
    private BigDecimal totalEarnings;
    private BigDecimal commission;
    private BigDecimal roi;
}
