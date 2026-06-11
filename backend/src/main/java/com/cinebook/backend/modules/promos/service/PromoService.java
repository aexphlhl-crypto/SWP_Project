package com.cinebook.backend.modules.promos.service;

import com.cinebook.backend.modules.promos.entity.PromoCode;
import com.cinebook.backend.modules.promos.entity.PromoStatus;
import com.cinebook.backend.modules.promos.repository.PromoCodeRepository;
import com.cinebook.backend.modules.promos.repository.PromoUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PromoService {
    private final PromoCodeRepository promoCodeRepository;
    private final PromoUsageRepository promoUsageRepository;

    public boolean validatePromo(String code, Long userId, Integer orderValue) {
        PromoCode promo = promoCodeRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Promo not found"));

        if (promo.getStatus() != PromoStatus.Active) {
            throw new RuntimeException("Promo is inactive");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(promo.getValidFrom()) || now.isAfter(promo.getValidUntil())) {
            throw new RuntimeException("Promo is expired or not yet valid");
        }

        if (promo.getMinOrderValue() != null && orderValue < promo.getMinOrderValue()) {
            throw new RuntimeException("Order value does not meet minimum requirement");
        }

        if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
            throw new RuntimeException("Promo usage limit exceeded");
        }

        long userUsageCount = promoUsageRepository.countByPromoIdAndUserId(promo.getId(), userId);
        if (userUsageCount > 0) {
            throw new RuntimeException("User has already used this promo");
        }

        return true;
    }

    public org.springframework.data.domain.Page<PromoCode> getAllPromos(org.springframework.data.domain.Pageable pageable) {
        return promoCodeRepository.findAll(pageable);
    }

    public PromoCode createPromo(PromoCode promoCode) {
        return promoCodeRepository.save(promoCode);
    }

    public PromoCode updatePromo(Long id, PromoCode promoDetails) {
        PromoCode promo = promoCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promo not found"));

        promo.setCode(promoDetails.getCode());
        promo.setDiscountType(promoDetails.getDiscountType());
        promo.setDiscountValue(promoDetails.getDiscountValue());
        promo.setMaxDiscountVnd(promoDetails.getMaxDiscountVnd());
        promo.setMinOrderValue(promoDetails.getMinOrderValue());
        promo.setUsageLimit(promoDetails.getUsageLimit());
        promo.setValidFrom(promoDetails.getValidFrom());
        promo.setValidUntil(promoDetails.getValidUntil());
        promo.setStatus(promoDetails.getStatus());

        return promoCodeRepository.save(promo);
    }

    public void deletePromo(Long id) {
        PromoCode promo = promoCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promo not found"));
        // Or set status to inactive
        promoCodeRepository.delete(promo);
    }
}
