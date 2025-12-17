package com.realestate.mlm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycStatusResponse {
    private String overallStatus;
    private String kycLevel;
    private Boolean isVerified;
    private LocalDateTime lastUpdated;
    private Integer totalDocumentsUploaded;
    private Integer approvedDocuments;
    private Integer pendingDocuments;
    private Integer rejectedDocuments;
    private List<DocumentStatus> documents;
    private String nextSteps;
    private List<String> requiredDocuments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentStatus {
        private Long id;
        private String documentType;
        private String documentName;
        private String status;
        private LocalDateTime uploadedAt;
        private LocalDateTime verifiedAt;
        private String rejectionReason;
    }
}
