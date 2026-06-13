package com.cinebook.backend.modules.fnb.service;

import com.cinebook.backend.modules.fnb.dto.FnBProductRequest;
import com.cinebook.backend.modules.fnb.entity.FnBProduct;
import com.cinebook.backend.modules.fnb.repository.FnBProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FnBProductService {
    private final FnBProductRepository repository;

    public Page<FnBProduct> getAllProducts(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public FnBProduct getProductById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public FnBProduct createProduct(FnBProductRequest request) {
        FnBProduct product = FnBProduct.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .status(request.getStatus())
                .build();
        return repository.save(product);
    }

    public FnBProduct updateProduct(Long id, FnBProductRequest request) {
        FnBProduct product = getProductById(id);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setStatus(request.getStatus());
        return repository.save(product);
    }

    public void deleteProduct(Long id) {
        repository.deleteById(id);
    }
}
