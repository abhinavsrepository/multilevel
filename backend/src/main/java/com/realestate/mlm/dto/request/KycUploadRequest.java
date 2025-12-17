package com.realestate.mlm.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KycUploadRequest {

    @NotBlank(message = "Document type is required")
    @Pattern(regexp = "^(AADHAR|PAN|DRIVING_LICENSE|PASSPORT|VOTER_ID)$",
            message = "Document type must be AADHAR, PAN, DRIVING_LICENSE, PASSPORT, or VOTER_ID")
    private String documentType;

    @NotBlank(message = "Document number is required")
    @Size(min = 6, max = 30, message = "Document number must be between 6 and 30 characters")
    private String documentNumber;

    @NotNull(message = "Document file is required")
    private MultipartFile file;
}
