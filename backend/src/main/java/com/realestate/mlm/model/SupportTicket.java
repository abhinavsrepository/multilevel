package com.realestate.mlm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_tickets", indexes = {
    @Index(name = "idx_ticket_id", columnList = "ticket_id", unique = true),
    @Index(name = "idx_ticket_user_id", columnList = "user_id"),
    @Index(name = "idx_ticket_status", columnList = "status"),
    @Index(name = "idx_ticket_priority", columnList = "priority"),
    @Index(name = "idx_ticket_category", columnList = "category"),
    @Index(name = "idx_ticket_assigned_to", columnList = "assigned_to_id"),
    @Index(name = "idx_ticket_created", columnList = "created_at"),
    @Index(name = "idx_ticket_user_status", columnList = "user_id,status")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", unique = true, nullable = false, length = 50)
    private String ticketId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Column(name = "category", nullable = false, length = 100)
    private String category; // INVESTMENT, COMMISSION, PAYOUT, KYC, TECHNICAL, COMPLAINT, OTHER

    @Column(name = "priority", nullable = false, length = 20)
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "description", columnDefinition = "text", nullable = false)
    private String description;

    @Column(name = "attachments", columnDefinition = "jsonb")
    private String attachments; // JSON array of attachment URLs

    @Column(name = "status", nullable = false, length = 50)
    private String status; // OPEN, IN_PROGRESS, PENDING_USER, WAITING_RESPONSE, RESOLVED, CLOSED, REOPENED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
