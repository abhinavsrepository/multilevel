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
public class TicketReplyResponse {
    private Long id;
    private String userId;
    private String userName;
    private String message;
    private java.util.List<String> attachments;
    private Boolean isAdmin;
    private Boolean isInternal;
    private LocalDateTime createdAt;
}
