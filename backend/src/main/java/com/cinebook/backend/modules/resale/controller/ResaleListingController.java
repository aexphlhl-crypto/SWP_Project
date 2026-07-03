package com.cinebook.backend.modules.resale.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.resale.dto.ResaleListingRequest;
import com.cinebook.backend.modules.resale.dto.ResaleListingResponse;
import com.cinebook.backend.modules.resale.dto.ResaleStatusUpdateRequest;
import com.cinebook.backend.modules.resale.service.ResaleListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resale")
@RequiredArgsConstructor
public class ResaleListingController {

    private final ResaleListingService service;

    @GetMapping("/admin/all")
    public ApiResponse<Page<ResaleListingResponse>> getAllListings(Pageable pageable) {
        return ApiResponse.ok(service.getAllListings(pageable));
    }

    @GetMapping("/active")
    public ApiResponse<Page<ResaleListingResponse>> getActiveListings(Pageable pageable) {
        return ApiResponse.ok(service.getActiveListings(pageable));
    }

    @GetMapping("/my-listings")
    public ApiResponse<Page<ResaleListingResponse>> getMyListings(@RequestParam Long sellerId, Pageable pageable) {
        return ApiResponse.ok(service.getMyListings(sellerId, pageable));
    }

    @PostMapping
    public ApiResponse<ResaleListingResponse> createListing(@RequestBody ResaleListingRequest request) {
        return ApiResponse.ok(service.createListing(request));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<ResaleListingResponse> updateStatus(@PathVariable Long id, @RequestBody ResaleStatusUpdateRequest request) {
        return ApiResponse.ok(service.updateStatus(id, request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ResaleListingResponse> updateListing(@PathVariable Long id, @RequestBody com.cinebook.backend.modules.resale.dto.ResaleListingUpdateRequest request) {
        return ApiResponse.ok(service.updateListing(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteListing(@PathVariable Long id) {
        service.deleteListing(id);
        return ApiResponse.ok(null);
    }
}
