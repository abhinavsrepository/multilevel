package com.realestate.mlm.repository;

import com.realestate.mlm.model.Payout;
import com.realestate.mlm.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, Long>, JpaSpecificationExecutor<Payout> {

    Optional<Payout> findByPayoutId(String payoutId);

    Page<Payout> findByUser(User user, Pageable pageable);

    Page<Payout> findByStatus(String status, Pageable pageable);

    Page<Payout> findByStatusOrderByRequestedAtDesc(String status, Pageable pageable);

    List<Payout> findByStatus(String status);

    List<Payout> findByStatusIn(List<String> statuses);

    Long countByStatus(String status);
}
