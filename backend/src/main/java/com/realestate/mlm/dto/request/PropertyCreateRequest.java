package com.realestate.mlm.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyCreateRequest {

    @NotBlank(message = "Property title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @NotBlank(message = "Property type is required")
    @Pattern(regexp = "^(RESIDENTIAL|COMMERCIAL|INDUSTRIAL|LAND)$",
            message = "Property type must be RESIDENTIAL, COMMERCIAL, INDUSTRIAL, or LAND")
    private String propertyType;

    @NotBlank(message = "Property category is required")
    @Pattern(regexp = "^(APARTMENT|VILLA|HOUSE|SHOP|OFFICE|WAREHOUSE|PLOT)$",
            message = "Property category must be APARTMENT, VILLA, HOUSE, SHOP, OFFICE, WAREHOUSE, or PLOT")
    private String propertyCategory;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 255, message = "Address must be between 5 and 255 characters")
    private String address;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 50, message = "City must be between 2 and 50 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, max = 50, message = "State must be between 2 and 50 characters")
    private String state;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be 6 digits")
    private String pincode;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Base price must be greater than 0")
    private BigDecimal basePrice;

    @NotNull(message = "Investment price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Investment price must be greater than 0")
    private BigDecimal investmentPrice;

    @NotNull(message = "Minimum investment is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Minimum investment must be greater than 0")
    private BigDecimal minimumInvestment;

    @DecimalMin(value = "0.0", message = "BV value must be greater than or equal to 0")
    private BigDecimal bvValue;

    @NotNull(message = "Expected ROI percentage is required")
    @DecimalMin(value = "0.0", message = "ROI percentage must be greater than or equal to 0")
    @DecimalMax(value = "100.0", message = "ROI percentage must not exceed 100")
    private BigDecimal expectedRoiPercent;

    @NotNull(message = "ROI tenure months is required")
    @Min(value = 1, message = "ROI tenure must be at least 1 month")
    @Max(value = 600, message = "ROI tenure must not exceed 600 months (50 years)")
    private Integer roiTenureMonths;

    @NotNull(message = "Total area is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total area must be greater than 0")
    private BigDecimal totalArea;

    @Min(value = 0, message = "Bedrooms must be at least 0")
    private Integer bedrooms;

    @Min(value = 0, message = "Bathrooms must be at least 0")
    private Integer bathrooms;

    private List<String> amenities;

    @NotEmpty(message = "At least one image is required")
    private List<MultipartFile> images;
}
