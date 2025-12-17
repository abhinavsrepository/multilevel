package com.realestate.mlm.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyInvestmentRequest {

    @NotBlank(message = "Property ID is required")
    private String propertyId;

    @NotNull(message = "Investment amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Investment amount must be greater than 0")
    private BigDecimal investmentAmount;

    @NotBlank(message = "Investment type is required")
    @Pattern(regexp = "^(LUMPSUM|INSTALLMENT)$", message = "Investment type must be LUMPSUM or INSTALLMENT")
    private String investmentType;

    @Pattern(regexp = "^(MONTHLY|QUARTERLY|YEARLY|CUSTOM)$", message = "Invalid installment plan")
    private String installmentPlan;

    @Min(value = 1, message = "Total installments must be at least 1")
    private Integer totalInstallments;

    @NotBlank(message = "Nominee name is required")
    @Size(min = 2, max = 100, message = "Nominee name must be between 2 and 100 characters")
    private String nomineeName;

    @NotBlank(message = "Nominee relation is required")
    @Size(min = 2, max = 50, message = "Nominee relation must be between 2 and 50 characters")
    private String nomineeRelation;

    @NotBlank(message = "Nominee contact is required")
    @Pattern(regexp = "^[0-9]{10}$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            message = "Nominee contact must be valid mobile or email")
    private String nomineeContact;

    @NotBlank(message = "Payment method is required")
    @Pattern(regexp = "^(CREDIT_CARD|DEBIT_CARD|NET_BANKING|UPI|WALLET)$",
            message = "Payment method must be CREDIT_CARD, DEBIT_CARD, NET_BANKING, UPI, or WALLET")
    private String paymentMethod;
}
