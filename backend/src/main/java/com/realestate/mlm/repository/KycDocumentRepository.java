package com.realestate.mlm.repository;

import com.realestate.mlm.model.KycDocument;
import com.realestate.mlm.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KycDocumentRepository extends JpaRepository<KycDocument, Long> {

    List<KycDocument> findByUser(User user);

    List<KycDocument> findByStatus(String status);

    Page<KycDocument> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Optional<KycDocument> findByUserAndDocumentType(User user, String documentType);

    Long countByStatus(String status);

    Long countByUser(User user);

    Long countByUserAndStatus(User user, String status);
}
