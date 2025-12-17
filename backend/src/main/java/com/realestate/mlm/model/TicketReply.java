package com.realestate.mlm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_replies", indexes = {
    @Index(name = "idx_reply_ticket_id", columnList = "ticket_id"),
    @Index(name = "idx_reply_user_id", columnList = "user_id"),
    @Index(name = "idx_reply_is_admin", columnList = "is_admin"),
    @Index(name = "idx_reply_created", columnList = "created_at"),
    @Index(name = "idx_reply_ticket_created", columnList = "ticket_id,created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private SupportTicket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "message", columnDefinition = "text", nullable = false)
    private String message;

    @Column(name = "attachments", columnDefinition = "jsonb")
    private String attachments; // JSON array of attachment URLs

    @Column(name = "is_admin", nullable = false)
    private Boolean isAdmin = false;

    @Column(name = "is_internal", nullable = false)
    private Boolean isInternal = false; // Internal notes not visible to user

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
