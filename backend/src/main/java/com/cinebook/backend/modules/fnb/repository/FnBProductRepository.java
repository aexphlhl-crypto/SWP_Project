package com.cinebook.backend.modules.fnb.repository;

import com.cinebook.backend.modules.fnb.entity.FnBProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FnBProductRepository extends JpaRepository<FnBProduct, Long> {
}
