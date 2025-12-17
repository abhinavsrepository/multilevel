package com.realestate.mlm.repository;

import com.realestate.mlm.model.PropertyInvestment;
import com.realestate.mlm.model.Property;
import com.realestate.mlm.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyInvestmentRepository extends JpaRepository<PropertyInvestment, Long> {

    Optional<PropertyInvestment> findByInvestmentId(String investmentId);

    Page<PropertyInvestment> findByUser(User user, Pageable pageable);

    List<PropertyInvestment> findByUser(User user);

    List<PropertyInvestment> findByProperty(Property property);

    List<PropertyInvestment> findByInvestmentStatus(String status);

    List<PropertyInvestment> findByCreatedAtGreaterThanEqual(LocalDateTime createdAt);

    @Query("SELECT SUM(pi.investmentAmount) FROM PropertyInvestment pi WHERE pi.user = :user")
    Double calculateTotalInvestmentByUser(@Param("user") User user);
}
