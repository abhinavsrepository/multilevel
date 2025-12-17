package com.realestate.mlm.repository;

import com.realestate.mlm.model.SupportTicket;
import com.realestate.mlm.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupportTicketRepository
        extends JpaRepository<SupportTicket, Long>, JpaSpecificationExecutor<SupportTicket> {

    Optional<SupportTicket> findByTicketId(String ticketId);

    Page<SupportTicket> findByUser(User user, Pageable pageable);

    Page<SupportTicket> findByStatus(String status, Pageable pageable);

    Long countByStatus(String status);
}
