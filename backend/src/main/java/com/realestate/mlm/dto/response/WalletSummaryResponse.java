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
public class WalletSummaryResponse {
    private BigDecimal totalBalance;
    private BigDecimal investmentBalance;
    private BigDecimal commissionBalance;
    private BigDecimal rentalIncomeBalance;
    private BigDecimal roiBalance;
    private BigDecimal withdrawableBalance;
    private BigDecimal lockedBalance;
    private BigDecimal totalEarned;
    private BigDecimal totalWithdrawn;
    private BigDecimal totalCredits;
    private BigDecimal totalDebits;
    private BigDecimal thisMonthEarnings;
    private BigDecimal todayEarnings;
    private Integer transactionCount;
}
