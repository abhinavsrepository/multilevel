package com.realestate.mlm.repository;

import com.realestate.mlm.model.Notification;
import com.realestate.mlm.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUser(User user, Pageable pageable);

    Long countByUserAndIsReadFalse(User user);

    List<Notification> findByIsBroadcastTrue();
}
