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
public class PayoutResponse {
    private String payoutId;
    private String userId;
    private String userName;
    private BigDecimal requestedAmount;
    private BigDecimal tdsAmount;
    private BigDecimal adminCharge;
    private BigDecimal netAmount;
    private String paymentMethod;
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String accountHolderName;
    private String branchName;
    private String upiId;
    private String status;
    private String rejectionReason;
    private String utrNumber;
    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime processedAt;
    private LocalDateTime completedAt;
}
