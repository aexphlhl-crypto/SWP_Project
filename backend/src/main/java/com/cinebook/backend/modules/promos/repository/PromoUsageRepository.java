package com.cinebook.backend.modules.promos.repository;

import com.cinebook.backend.modules.promos.entity.PromoUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromoUsageRepository extends JpaRepository<PromoUsage, Long> {
    long countByPromoIdAndUserId(Long promoId, Long userId);
}
