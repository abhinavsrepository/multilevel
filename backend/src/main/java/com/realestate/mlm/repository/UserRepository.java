package com.realestate.mlm.repository;

import com.realestate.mlm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByMobile(String mobile);

    Optional<User> findByUserId(String userId);

    List<User> findBySponsorId(String sponsorId);

    List<User> findByPlacementUserAndPlacement(User placementUser, String placement);

    Optional<User> findBySponsorAndPlacement(User sponsor, String placement);

    List<User> findByStatus(String status);

    @Query("SELECT u FROM User u WHERE u.level = :level")
    List<User> findByLevel(@Param("level") Integer level);

    Long countByStatus(String status);

    Long countByCreatedAtGreaterThanEqual(LocalDateTime createdAt);

    Long countBySponsorId(String sponsorId);
}
