package com.realestate.mlm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity for managing auto-incrementing sequences for user ID generation
 */
@Entity
@Table(name = "user_sequences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String sequenceName;

    @Column(nullable = false)
    private Long currentValue;

    @Version
    private Long version; // For optimistic locking
}
