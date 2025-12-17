package com.realestate.mlm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponse {
    private Long propertyId;
    private String title;
    private String description;
    private String propertyType;
    private String city;
    private String state;
    private BigDecimal basePrice;
    private BigDecimal investmentPrice;
    private BigDecimal minimumInvestment;
    private BigDecimal expectedRoiPercent;
    private BigDecimal totalArea;
    private Integer bedrooms;
    private Integer bathrooms;
    private List<String> amenities;
    private List<String> images;
    private String status;
    private Boolean featured;
    private LocalDateTime createdAt;
}
