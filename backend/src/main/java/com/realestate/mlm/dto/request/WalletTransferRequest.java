package com.realestate.mlm.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransferRequest {

    @NotBlank(message = "Recipient user ID is required")
    private String toUserId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Wallet type is required")
    @Pattern(regexp = "^(PRIMARY|SECONDARY|INVESTMENT|BONUS)$",
            message = "Wallet type must be PRIMARY, SECONDARY, INVESTMENT, or BONUS")
    private String walletType;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;
}
