package com.realestate.mlm.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstallmentPaymentRequest {
    @NotNull(message = "Installment number is required")
    @Positive(message = "Installment number must be positive")
    private Integer installmentNumber;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private String paymentMethod; // WALLET, RAZORPAY, etc.

    private String transactionPin; // For wallet payments
    private String razorpayPaymentId; // For Razorpay payments
    private String razorpayOrderId; // For Razorpay payments
    private String razorpaySignature; // For Razorpay payments
}
