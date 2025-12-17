package com.realestate.mlm.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "properties", indexes = {
    @Index(name = "idx_property_id", columnList = "property_id", unique = true),
    @Index(name = "idx_property_type", columnList = "property_type"),
    @Index(name = "idx_property_category", columnList = "property_category"),
    @Index(name = "idx_city", columnList = "city"),
    @Index(name = "idx_state", columnList = "state"),
    @Index(name = "idx_base_price", columnList = "base_price"),
    @Index(name = "idx_status", columnList = "status")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", unique = true, nullable = false, length = 50)
    private String propertyId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "property_type", nullable = false, length = 50)
    private String propertyType; // RESIDENTIAL, COMMERCIAL, MIXED

    @Column(name = "property_category", nullable = false, length = 50)
    private String propertyCategory; // APARTMENT, VILLA, PLOT, COMMERCIAL, etc.

    // Location Fields
    @Column(name = "address", nullable = false, columnDefinition = "text")
    private String address;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state", nullable = false, length = 100)
    private String state;

    @Column(name = "pincode", length = 10)
    private String pincode;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "google_maps_link", length = 500)
    private String googleMapsLink;

    // Specifications
    @Column(name = "total_area", precision = 12, scale = 2)
    private BigDecimal totalArea; // in sq ft

    @Column(name = "built_up_area", precision = 12, scale = 2)
    private BigDecimal builtUpArea; // in sq ft

    @Column(name = "bedrooms")
    private Integer bedrooms;

    @Column(name = "bathrooms")
    private Integer bathrooms;

    @Column(name = "floors")
    private Integer floors;

    @Column(name = "facing", length = 50)
    private String facing; // NORTH, SOUTH, EAST, WEST, etc.

    @Column(name = "furnishing_status", length = 50)
    private String furnishingStatus; // FURNISHED, SEMI_FURNISHED, UNFURNISHED

    // Pricing
    @Column(name = "base_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "investment_price", precision = 15, scale = 2)
    private BigDecimal investmentPrice;

    @Column(name = "minimum_investment", precision = 15, scale = 2)
    private BigDecimal minimumInvestment;

    @Column(name = "total_investment_slots", nullable = false)
    private Integer totalInvestmentSlots;

    @Column(name = "slots_booked")
    private Integer slotsBooked;

    // Commission
    @Column(name = "direct_referral_commission_percent", precision = 5, scale = 2)
    private BigDecimal directReferralCommissionPercent;

    @Column(name = "bv_value", precision = 15, scale = 2)
    private BigDecimal bvValue; // Business Volume Value

    // ROI
    @Column(name = "expected_roi_percent", precision = 5, scale = 2)
    private BigDecimal expectedRoiPercent;

    @Column(name = "roi_tenure_months")
    private Integer roiTenureMonths;

    @Column(name = "appreciation_rate_annual", precision = 5, scale = 2)
    private BigDecimal appreciationRateAnnual;

    // Developer Details
    @Column(name = "developer_name", length = 255)
    private String developerName;

    @Column(name = "developer_contact", length = 20)
    private String developerContact;

    @Column(name = "developer_email", length = 100)
    private String developerEmail;

    @Column(name = "rera_number", length = 100)
    private String reraNumber;

    // Media
    @Column(name = "images", columnDefinition = "jsonb")
    private String images; // JSON array of image URLs

    @Column(name = "videos", columnDefinition = "jsonb")
    private String videos; // JSON array of video URLs

    @Column(name = "virtual_tour_url", length = 500)
    private String virtualTourUrl;

    // Status and Dates
    @Column(name = "status", nullable = false, length = 50)
    private String status; // ACTIVE, INACTIVE, SOLD_OUT, UNDER_MAINTENANCE

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

}
