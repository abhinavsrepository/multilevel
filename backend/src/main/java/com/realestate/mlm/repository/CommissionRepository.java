package com.realestate.mlm.repository;

import com.realestate.mlm.model.Commission;
import com.realestate.mlm.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Long>, JpaSpecificationExecutor<Commission> {

        Optional<Commission> findByCommissionId(String commissionId);

        Page<Commission> findByUser(User user, Pageable pageable);

        Page<Commission> findByUserAndCommissionType(User user, String commissionType, Pageable pageable);

        List<Commission> findByStatus(String status);

        List<Commission> findByStatusAndCreatedAtGreaterThanEqual(String status, LocalDateTime createdAt);

        @Query("SELECT SUM(c.amount) FROM Commission c WHERE c.user = :user AND c.commissionType = :commissionType")
        Double sumCommissionsByUserAndType(
                        @Param("user") User user,
                        @Param("commissionType") String commissionType);

        /**
         * Get total commission amount for a user between start and end time with
         * specific status
         * This is optimized to run directly on the database
         */
        @Query("SELECT COALESCE(SUM(c.amount), 0) FROM Commission c WHERE c.user = :user " +
                        "AND c.status = :status " +
                        "AND c.createdAt >= :startTime AND c.createdAt <= :endTime")
        BigDecimal sumCommissionsByUserBetweenDates(
                        @Param("user") User user,
                        @Param("status") String status,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        /**
         * Get commissions for a user created between start and end time
         */
        @Query("SELECT c FROM Commission c WHERE c.user = :user " +
                        "AND c.createdAt >= :startTime AND c.createdAt <= :endTime " +
                        "AND c.status = :status")
        List<Commission> findByUserAndCreatedAtBetweenAndStatus(
                        @Param("user") User user,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime,
                        @Param("status") String status);
}
