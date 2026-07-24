package com.cinebook.backend.modules.fnb.service;

import com.cinebook.backend.common.exception.AppException;
import com.cinebook.backend.modules.fnb.dto.FnBProductRequest;
import com.cinebook.backend.modules.fnb.entity.FnBProduct;
import com.cinebook.backend.modules.fnb.entity.FnBProductStatus;
import com.cinebook.backend.modules.fnb.repository.FnBProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FnBProductService {
    private final FnBProductRepository repository;

    public Page<FnBProduct> getAllProducts(Pageable pageable, Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return repository.findByStatus(FnBProductStatus.Active, pageable);
        }
        return repository.findAll(pageable);
    }

    public FnBProduct getProductById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy sản phẩm F&B có ID: " + id));
    }

    public FnBProduct createProduct(FnBProductRequest request) {
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw AppException.badRequest("Giá sản phẩm F&B phải lớn hơn 0 VNĐ.");
        }

        FnBProduct product = FnBProduct.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .status(request.getStatus() != null ? request.getStatus() : FnBProductStatus.Active)
                .build();
        return repository.save(product);
    }

    public FnBProduct updateProduct(Long id, FnBProductRequest request) {
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw AppException.badRequest("Giá sản phẩm F&B phải lớn hơn 0 VNĐ.");
        }

        FnBProduct product = getProductById(id);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }
        return repository.save(product);
    }

    public void deleteProduct(Long id) {
        if (!repository.existsById(id)) {
            throw AppException.notFound("Không tìm thấy sản phẩm F&B có ID: " + id);
        }
        repository.deleteById(id);
    }
}
