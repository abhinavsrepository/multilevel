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
public class ActivityResponse {
    private Long id; // Changed from activityId to match frontend
    private String type;
    private String icon;
    private String description;
    private BigDecimal amount;
    private String timeAgo;
    private String status;
    private String statusColor;
    private LocalDateTime createdAt; // Keep for backend calculations
}
