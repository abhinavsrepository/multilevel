package com.realestate.mlm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.mlm.dto.request.PropertyCreateRequest;
import com.realestate.mlm.dto.response.PageResponse;
import com.realestate.mlm.dto.response.PropertyResponse;
import com.realestate.mlm.exception.BadRequestException;
import com.realestate.mlm.exception.ResourceNotFoundException;
import com.realestate.mlm.model.Property;
import com.realestate.mlm.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    /**
     * Create new property with images
     */
    @Transactional
    public PropertyResponse createProperty(PropertyCreateRequest request) {
        log.info("Creating new property: {}", request.getTitle());

        // Validate minimum investment
        if (request.getMinimumInvestment().compareTo(request.getInvestmentPrice()) > 0) {
            throw new BadRequestException("Minimum investment cannot be greater than investment price");
        }

        // Upload images
        List<String> imageUrls = new ArrayList<>();
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            imageUrls = fileStorageService.uploadFiles(request.getImages(), "properties");
        }

        // Create property entity
        Property property = new Property();
        property.setPropertyId(generatePropertyId());
        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setPropertyType(request.getPropertyType());
        property.setPropertyCategory(request.getPropertyCategory());
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setPincode(request.getPincode());
        property.setBasePrice(request.getBasePrice());
        property.setInvestmentPrice(request.getInvestmentPrice());
        property.setMinimumInvestment(request.getMinimumInvestment());
        property.setBvValue(request.getBvValue());
        property.setExpectedRoiPercent(request.getExpectedRoiPercent());
        property.setRoiTenureMonths(request.getRoiTenureMonths());
        property.setTotalArea(request.getTotalArea());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());

        // Calculate total slots (assuming each slot is minimum investment)
        int totalSlots = request.getInvestmentPrice()
                .divide(request.getMinimumInvestment(), 0, BigDecimal.ROUND_DOWN)
                .intValue();
        property.setTotalInvestmentSlots(totalSlots);
        property.setSlotsBooked(0);

        property.setStatus("ACTIVE");
        property.setIsVerified(false);

        // Store images as JSON
        try {
            property.setImages(objectMapper.writeValueAsString(imageUrls));
        } catch (Exception e) {
            log.error("Error serializing images: ", e);
            property.setImages("[]");
        }

        Property savedProperty = propertyRepository.save(property);
        log.info("Property created successfully with ID: {}", savedProperty.getPropertyId());

        return mapToResponse(savedProperty);
    }

    /**
     * Update property
     */
    @Transactional
    public PropertyResponse updateProperty(Long id, PropertyCreateRequest request) {
        log.info("Updating property ID: {}", id);

        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));

        // Update basic details
        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setPropertyType(request.getPropertyType());
        property.setPropertyCategory(request.getPropertyCategory());
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setPincode(request.getPincode());
        property.setBasePrice(request.getBasePrice());
        property.setInvestmentPrice(request.getInvestmentPrice());
        property.setMinimumInvestment(request.getMinimumInvestment());
        property.setBvValue(request.getBvValue());
        property.setExpectedRoiPercent(request.getExpectedRoiPercent());
        property.setRoiTenureMonths(request.getRoiTenureMonths());
        property.setTotalArea(request.getTotalArea());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());

        // Upload new images if provided
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            List<String> imageUrls = fileStorageService.uploadFiles(request.getImages(), "properties");
            try {
                property.setImages(objectMapper.writeValueAsString(imageUrls));
            } catch (Exception e) {
                log.error("Error serializing images: ", e);
            }
        }

        Property updatedProperty = propertyRepository.save(property);
        log.info("Property updated successfully: {}", updatedProperty.getPropertyId());

        return mapToResponse(updatedProperty);
    }

    /**
     * Get property by ID
     */
    public PropertyResponse getPropertyById(Long id) {
        log.info("Fetching property by ID: {}", id);

        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));

        return mapToResponse(property);
    }

    /**
     * Get all properties with filters and pagination
     */
    public PageResponse<PropertyResponse> getAllProperties(
            Pageable pageable,
            String status,
            String type,
            String city,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Double minArea,
            Double maxArea) {
        log.info(
                "Fetching properties with filters - status: {}, type: {}, city: {}, minPrice: {}, maxPrice: {}, minArea: {}, maxArea: {}",
                status, type, city, minPrice, maxPrice, minArea, maxArea);

        Specification<Property> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (type != null && !type.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("propertyType"), type));
            }

            if (city != null && !city.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("city"), city));
            }

            if (status != null && !status.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("basePrice"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("basePrice"), maxPrice));
            }

            if (minArea != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("totalArea"), minArea));
            }

            if (maxArea != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("totalArea"), maxArea));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Property> properties = propertyRepository.findAll(spec, pageable);
        Page<PropertyResponse> pageResult = properties.map(this::mapToResponse);

        return PageResponse.<PropertyResponse>builder()
                .content(pageResult.getContent())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .first(pageResult.isFirst())
                .last(pageResult.isLast())
                .build();
    }

    /**
     * Search properties by query (List version)
     */
    public List<PropertyResponse> searchProperties(String query) {
        return searchProperties(query, Pageable.unpaged()).getContent();
    }

    /**
     * Get featured properties
     */
    public List<PropertyResponse> getFeaturedProperties() {
        log.info("Fetching featured properties");

        List<Property> properties = propertyRepository.findAll().stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()))
                .limit(10)
                .collect(Collectors.toList());

        return properties.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Delete property (soft delete)
     */
    @Transactional
    public void deleteProperty(Long id) {
        log.info("Deleting property ID: {}", id);

        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));

        // Check if property has any investments
        if (property.getSlotsBooked() != null && property.getSlotsBooked() > 0) {
            // Soft delete - mark as inactive
            property.setStatus("INACTIVE");
            propertyRepository.save(property);
            log.info("Property soft deleted (marked as INACTIVE): {}", id);
        } else {
            // Hard delete if no investments
            propertyRepository.delete(property);
            log.info("Property hard deleted: {}", id);
        }
    }

    /**
     * Upload property images
     */
    @Transactional
    public List<String> uploadPropertyImages(Long id, List<MultipartFile> files) {
        log.info("Uploading {} images for property ID: {}", files.size(), id);

        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));

        // Upload new images
        List<String> newImageUrls = fileStorageService.uploadFiles(files, "properties");

        // Get existing images
        List<String> existingImages = parseImages(property.getImages());
        existingImages.addAll(newImageUrls);

        // Save updated images
        try {
            property.setImages(objectMapper.writeValueAsString(existingImages));
            propertyRepository.save(property);
        } catch (Exception e) {
            log.error("Error serializing images: ", e);
            throw new RuntimeException("Failed to save images");
        }

        log.info("Successfully uploaded {} images for property: {}", newImageUrls.size(), id);

        return newImageUrls;
    }

    /**
     * Update property market value (appreciation)
     */
    @Transactional
    public PropertyResponse updatePropertyMarketValue(Long id, BigDecimal newValue) {
        log.info("Updating market value for property ID: {} to: {}", id, newValue);

        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));

        property.setBasePrice(newValue);
        property.setUpdatedAt(LocalDateTime.now());

        Property updatedProperty = propertyRepository.save(property);
        log.info("Market value updated successfully for property: {}", id);

        return mapToResponse(updatedProperty);
    }

    /**
     * Search properties by query
     */
    public Page<PropertyResponse> searchProperties(String query, Pageable pageable) {
        log.info("Searching properties with query: {}", query);

        Specification<Property> spec = (root, criteriaQuery, criteriaBuilder) -> {
            String likePattern = "%" + query.toLowerCase() + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("city")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("state")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("address")), likePattern));
        };

        Page<Property> properties = propertyRepository.findAll(spec, pageable);

        return properties.map(this::mapToResponse);
    }

    /**
     * Generate unique property ID
     */
    private String generatePropertyId() {
        return "PROP" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    /**
     * Parse images JSON string
     */
    private List<String> parseImages(String imagesJson) {
        try {
            if (imagesJson == null || imagesJson.isEmpty()) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(imagesJson, objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            log.error("Error parsing images JSON: ", e);
            return new ArrayList<>();
        }
    }

    /**
     * Map Property entity to PropertyResponse DTO
     */
    private PropertyResponse mapToResponse(Property property) {
        return PropertyResponse.builder()
                .propertyId(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .propertyType(property.getPropertyType())
                .city(property.getCity())
                .state(property.getState())
                .basePrice(property.getBasePrice())
                .investmentPrice(property.getInvestmentPrice())
                .minimumInvestment(property.getMinimumInvestment())
                .expectedRoiPercent(property.getExpectedRoiPercent())
                .totalArea(property.getTotalArea())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .images(parseImages(property.getImages()))
                .status(property.getStatus())
                .createdAt(property.getCreatedAt())
                .build();
    }
}
