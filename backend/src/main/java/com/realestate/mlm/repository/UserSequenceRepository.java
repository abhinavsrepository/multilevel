package com.realestate.mlm.repository;

import com.realestate.mlm.model.UserSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

/**
 * Repository for managing user ID sequences
 */
@Repository
public interface UserSequenceRepository extends JpaRepository<UserSequence, Long> {

    /**
     * Find sequence by name with pessimistic write lock to prevent concurrent updates
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM UserSequence s WHERE s.sequenceName = :sequenceName")
    Optional<UserSequence> findBySequenceNameForUpdate(@Param("sequenceName") String sequenceName);

    /**
     * Find sequence by name
     */
    Optional<UserSequence> findBySequenceName(String sequenceName);

    /**
     * Get next sequence value for a given sequence name
     * This method handles the increment logic and ensures thread safety
     */
    default long getNextSequence(String sequenceName) {
        // Find or create sequence
        Optional<UserSequence> sequenceOpt = findBySequenceNameForUpdate(sequenceName);

        UserSequence sequence;
        if (sequenceOpt.isPresent()) {
            sequence = sequenceOpt.get();
            sequence.setCurrentValue(sequence.getCurrentValue() + 1);
        } else {
            // Create new sequence starting from 1
            sequence = UserSequence.builder()
                    .sequenceName(sequenceName)
                    .currentValue(1L)
                    .build();
        }

        UserSequence savedSequence = save(sequence);
        return savedSequence.getCurrentValue();
    }
}
