package com.realestate.mlm.controller;

import com.realestate.mlm.dto.request.PropertyCreateRequest;
import com.realestate.mlm.dto.response.ApiResponse;
import com.realestate.mlm.dto.response.PageResponse;
import com.realestate.mlm.dto.response.PropertyResponse;
import com.realestate.mlm.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST controller for property management
 */
@RestController
@RequestMapping("/properties")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@Tag(name = "Property Management", description = "Property listing and management endpoints")
public class PropertyController {

        private final PropertyService propertyService;

        @Operation(summary = "Get all properties", description = "Get paginated list of all properties with optional filters")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Properties retrieved successfully")
        })
        @GetMapping("/")
        public ResponseEntity<PageResponse<PropertyResponse>> getAllProperties(
                        @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
                        @Parameter(description = "Filter by status") @RequestParam(required = false) String status,
                        @Parameter(description = "Filter by property type") @RequestParam(required = false) String propertyType,
                        @Parameter(description = "Filter by location/city") @RequestParam(required = false) String location,
                        @Parameter(description = "Minimum price") @RequestParam(required = false) BigDecimal minPrice,
                        @Parameter(description = "Maximum price") @RequestParam(required = false) BigDecimal maxPrice,
                        @Parameter(description = "Minimum area (sqft)") @RequestParam(required = false) Double minArea,
                        @Parameter(description = "Maximum area (sqft)") @RequestParam(required = false) Double maxArea) {

                PageResponse<PropertyResponse> properties = propertyService.getAllProperties(
                                pageable, status, propertyType, location, minPrice, maxPrice, minArea, maxArea);
                return ResponseEntity.ok(properties);
        }

        @Operation(summary = "Get property by ID", description = "Get detailed information about a specific property")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Property retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Property not found")
        })
        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<PropertyResponse>> getPropertyById(
                        @Parameter(description = "Property ID") @PathVariable Long id) {
                PropertyResponse property = propertyService.getPropertyById(id);
                return ResponseEntity.ok(ApiResponse.<PropertyResponse>builder()
                                .success(true)
                                .message("Property retrieved successfully")
                                .data(property)
                                .build());
        }

        @Operation(summary = "Get featured properties", description = "Get list of featured properties for homepage")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Featured properties retrieved successfully")
        })
        @GetMapping("/featured")
        public ResponseEntity<ApiResponse<List<PropertyResponse>>> getFeaturedProperties() {
                List<PropertyResponse> properties = propertyService.getFeaturedProperties();
                return ResponseEntity.ok(ApiResponse.<List<PropertyResponse>>builder()
                                .success(true)
                                .message("Featured properties retrieved successfully")
                                .data(properties)
                                .build());
        }

        @Operation(summary = "Search properties", description = "Search properties by keyword (name, location, description)")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Search completed successfully")
        })
        @GetMapping("/search")
        public ResponseEntity<ApiResponse<List<PropertyResponse>>> searchProperties(
                        @Parameter(description = "Search query") @RequestParam String query) {
                List<PropertyResponse> properties = propertyService.searchProperties(query);
                return ResponseEntity.ok(ApiResponse.<List<PropertyResponse>>builder()
                                .success(true)
                                .message("Search completed successfully")
                                .data(properties)
                                .build());
        }

        @Operation(summary = "Create property", description = "Create a new property listing (Admin only)")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Property created successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
        })
        @SecurityRequirement(name = "bearerAuth")
        @PreAuthorize("hasRole('ADMIN')")
        @PostMapping("/")
        public ResponseEntity<ApiResponse<PropertyResponse>> createProperty(
                        @Valid @RequestBody PropertyCreateRequest request) {
                PropertyResponse property = propertyService.createProperty(request);
                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(ApiResponse.<PropertyResponse>builder()
                                                .success(true)
                                                .message("Property created successfully")
                                                .data(property)
                                                .build());
        }

        @Operation(summary = "Update property", description = "Update an existing property listing (Admin only)")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Property updated successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Property not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
        })
        @SecurityRequirement(name = "bearerAuth")
        @PreAuthorize("hasRole('ADMIN')")
        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<PropertyResponse>> updateProperty(
                        @Parameter(description = "Property ID") @PathVariable Long id,
                        @Valid @RequestBody PropertyCreateRequest request) {
                PropertyResponse property = propertyService.updateProperty(id, request);
                return ResponseEntity.ok(ApiResponse.<PropertyResponse>builder()
                                .success(true)
                                .message("Property updated successfully")
                                .data(property)
                                .build());
        }

        @Operation(summary = "Delete property", description = "Delete a property listing (Admin only)")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Property deleted successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Property not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
        })
        @SecurityRequirement(name = "bearerAuth")
        @PreAuthorize("hasRole('ADMIN')")
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<String>> deleteProperty(
                        @Parameter(description = "Property ID") @PathVariable Long id) {
                propertyService.deleteProperty(id);
                return ResponseEntity.ok(ApiResponse.<String>builder()
                                .success(true)
                                .message("Property deleted successfully")
                                .data("Property deleted successfully")
                                .build());
        }
}
