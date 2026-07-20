package com.cinebook.backend.modules.promos.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.promos.service.PromoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/promos")
@RequiredArgsConstructor
public class PromoController {
    private final PromoService service;

    @GetMapping("/validate")
    public ApiResponse<com.cinebook.backend.modules.promos.entity.PromoCode> validatePromo(
            @RequestParam String code,
            @RequestParam Long userId,
            @RequestParam Integer orderValue) {
        try {
            com.cinebook.backend.modules.promos.entity.PromoCode promo = service.validatePromo(code, userId, orderValue);
            return ApiResponse.ok(promo);
        } catch (Exception e) {
            return ApiResponse.error("BAD_REQUEST", e.getMessage());
        }
    }

    @GetMapping
    public ApiResponse<org.springframework.data.domain.Page<com.cinebook.backend.modules.promos.entity.PromoCode>> getAllPromos(org.springframework.data.domain.Pageable pageable) {
        return ApiResponse.ok(service.getAllPromos(pageable));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<com.cinebook.backend.modules.promos.entity.PromoCode> createPromo(@RequestBody com.cinebook.backend.modules.promos.entity.PromoCode promoCode) {
        return ApiResponse.ok(service.createPromo(promoCode));
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<com.cinebook.backend.modules.promos.entity.PromoCode> updatePromo(
            @PathVariable Long id, 
            @RequestBody com.cinebook.backend.modules.promos.entity.PromoCode promoCode) {
        return ApiResponse.ok(service.updatePromo(id, promoCode));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<Void> deletePromo(@PathVariable Long id) {
        service.deletePromo(id);
        return ApiResponse.ok(null);
    }
}
