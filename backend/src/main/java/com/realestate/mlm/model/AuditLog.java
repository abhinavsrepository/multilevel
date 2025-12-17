package com.realestate.mlm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_user_id", columnList = "user_id"),
    @Index(name = "idx_audit_entity_type", columnList = "entity_type"),
    @Index(name = "idx_audit_entity_id", columnList = "entity_id"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_created", columnList = "created_at"),
    @Index(name = "idx_audit_user_action", columnList = "user_id,action"),
    @Index(name = "idx_audit_entity_date", columnList = "entity_type,entity_id,created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // User who performed the action

    @Column(name = "action", nullable = false, length = 50)
    private String action; // CREATE, READ, UPDATE, DELETE, LOGIN, EXPORT, etc.

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType; // User, Property, Investment, Commission, etc.

    @Column(name = "entity_id", nullable = false, length = 100)
    private String entityId; // ID of the entity being audited

    @Column(name = "old_values", columnDefinition = "jsonb")
    private String oldValues; // JSON object of old values before update

    @Column(name = "new_values", columnDefinition = "jsonb")
    private String newValues; // JSON object of new values after update

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "text")
    private String userAgent;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // SUCCESS, FAILURE

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
