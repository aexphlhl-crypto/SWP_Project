package com.cinebook.backend.modules.fnb.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.fnb.dto.FnBProductRequest;
import com.cinebook.backend.modules.fnb.entity.FnBProduct;
import com.cinebook.backend.modules.fnb.service.FnBProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fnb/products")
@RequiredArgsConstructor
public class FnBProductController {
    private final FnBProductService service;

    @GetMapping
    public ApiResponse<Page<FnBProduct>> getAll(Pageable pageable) {
        return ApiResponse.ok(service.getAllProducts(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<FnBProduct> getById(@PathVariable Long id) {
        return ApiResponse.ok(service.getProductById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<FnBProduct> create(@RequestBody FnBProductRequest request) {
        return ApiResponse.ok(service.createProduct(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<FnBProduct> update(@PathVariable Long id, @RequestBody FnBProductRequest request) {
        return ApiResponse.ok(service.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.deleteProduct(id);
        return ApiResponse.ok(null);
    }
}
