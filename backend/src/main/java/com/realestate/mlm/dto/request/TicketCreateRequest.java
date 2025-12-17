package com.realestate.mlm.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketCreateRequest {

    @NotBlank(message = "Subject is required")
    @Size(min = 5, max = 200, message = "Subject must be between 5 and 200 characters")
    private String subject;

    @NotBlank(message = "Category is required")
    @Pattern(regexp = "^(GENERAL|BILLING|TECHNICAL|ACCOUNT|INVESTMENT|WITHDRAWAL|OTHER)$",
            message = "Category must be GENERAL, BILLING, TECHNICAL, ACCOUNT, INVESTMENT, WITHDRAWAL, or OTHER")
    private String category;

    @NotBlank(message = "Priority is required")
    @Pattern(regexp = "^(LOW|MEDIUM|HIGH|URGENT)$",
            message = "Priority must be LOW, MEDIUM, HIGH, or URGENT")
    private String priority;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    private List<MultipartFile> attachments;
}
