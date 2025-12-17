package com.realestate.mlm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String userId;
    private String fullName;
    private String email;
    private String mobile;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private String sponsorId;
    private String placementId;
    private String placementSide;
    private String status;
    private String role;
    private String rank;
    private String kycStatus;
    private BigDecimal totalEarnings;
    private BigDecimal totalInvestment;
    private String profilePicture;
    private LocalDateTime createdAt;
}
