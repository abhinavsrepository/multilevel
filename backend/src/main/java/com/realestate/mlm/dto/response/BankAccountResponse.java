package com.realestate.mlm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccountResponse {
    private Long id;
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String accountHolderName;
    private String branchName;
    private String accountType;
    private String upiId;
    private Boolean isVerified;
    private Boolean isPrimary;
    private String verificationMethod;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;
}
