package com.cinebook.backend.modules.fnb.repository;

import com.cinebook.backend.modules.fnb.entity.FnBProduct;
import com.cinebook.backend.modules.fnb.entity.FnBProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FnBProductRepository extends JpaRepository<FnBProduct, Long> {
    Page<FnBProduct> findByStatus(FnBProductStatus status, Pageable pageable);
    List<FnBProduct> findByStatus(FnBProductStatus status);
}
