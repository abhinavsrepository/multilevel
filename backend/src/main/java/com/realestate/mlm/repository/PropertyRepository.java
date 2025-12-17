package com.realestate.mlm.repository;

import com.realestate.mlm.model.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {

    Optional<Property> findByPropertyId(String propertyId);

    Page<Property> findByPropertyType(String propertyType, Pageable pageable);

    Page<Property> findByCity(String city, Pageable pageable);

    Page<Property> findByStatus(String status, Pageable pageable);

    @Query("SELECT p FROM Property p WHERE p.basePrice BETWEEN :minPrice AND :maxPrice")
    Page<Property> findByPriceRange(
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            Pageable pageable);

    Long countByStatus(String status);
}
