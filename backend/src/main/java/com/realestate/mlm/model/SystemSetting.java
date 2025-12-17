package com.realestate.mlm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_settings", indexes = {
    @Index(name = "idx_setting_key", columnList = "setting_key", unique = true),
    @Index(name = "idx_setting_category", columnList = "category")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setting_key", unique = true, nullable = false, length = 100)
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "text", nullable = false)
    private String settingValue;

    @Column(name = "data_type", length = 50)
    private String dataType; // STRING, INTEGER, DECIMAL, BOOLEAN, JSON, DATE

    @Column(name = "category", length = 100)
    private String category; // COMMISSION, INVESTMENT, PAYOUT, SECURITY, GENERAL

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;
}
