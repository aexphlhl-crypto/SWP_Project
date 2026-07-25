package com.cinebook.backend.modules.resale.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.resale.dto.ResaleListingRequest;
import com.cinebook.backend.modules.resale.dto.ResaleListingResponse;
import com.cinebook.backend.modules.resale.dto.ResaleStatusUpdateRequest;
import com.cinebook.backend.modules.resale.service.ResaleListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resale")
@RequiredArgsConstructor
public class ResaleListingController {

    private final ResaleListingService service;

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<Page<ResaleListingResponse>> getAllListings(Pageable pageable) {
        return ApiResponse.ok(service.getAllListings(pageable));
    }

    @GetMapping("/active")
    public ApiResponse<Page<ResaleListingResponse>> getActiveListings(Pageable pageable) {
        return ApiResponse.ok(service.getActiveListings(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ResaleListingResponse> getListingById(@PathVariable Long id) {
        return ApiResponse.ok(service.getListingById(id));
    }

    @GetMapping("/my-listings")
    @PreAuthorize("hasRole('Customer')")
    public ApiResponse<Page<ResaleListingResponse>> getMyListings(@RequestParam(required = false) Long sellerId, Pageable pageable) {
        return ApiResponse.ok(service.getMyListings(sellerId, pageable));
    }

    @PostMapping
    @PreAuthorize("hasRole('Customer')")
    public ApiResponse<ResaleListingResponse> createListing(@RequestBody ResaleListingRequest request) {
        return ApiResponse.ok(service.createListing(request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<ResaleListingResponse> updateStatus(@PathVariable Long id, @RequestBody ResaleStatusUpdateRequest request) {
        return ApiResponse.ok(service.updateStatus(id, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Customer')")
    public ApiResponse<ResaleListingResponse> updateListing(@PathVariable Long id, @RequestBody com.cinebook.backend.modules.resale.dto.ResaleListingUpdateRequest request) {
        return ApiResponse.ok(service.updateListing(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Customer')")
    public ApiResponse<Void> deleteListing(@PathVariable Long id) {
        service.deleteListing(id);
        return ApiResponse.ok(null);
    }
}
