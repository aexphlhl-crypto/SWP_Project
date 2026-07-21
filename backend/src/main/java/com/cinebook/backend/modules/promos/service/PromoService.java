package com.cinebook.backend.modules.promos.service;

import com.cinebook.backend.common.exception.AppException;
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

    public PromoCode validatePromo(String code, Long userId, Integer orderValue) {
        PromoCode promo = promoCodeRepository.findByCode(code)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy mã khuyến mãi."));

        if (promo.getStatus() != PromoStatus.Active) {
            throw AppException.badRequest("Mã khuyến mãi đang không hoạt động.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(promo.getValidFrom()) || now.isAfter(promo.getValidUntil())) {
            throw AppException.badRequest("Mã khuyến mãi đã hết hạn hoặc chưa có hiệu lực.");
        }

        if (promo.getMinOrderValue() != null && orderValue < promo.getMinOrderValue()) {
            throw AppException.badRequest("Giá trị đơn hàng không đạt mức tối thiểu " + promo.getMinOrderValue() + " VNĐ để áp dụng mã.");
        }

        if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
            throw AppException.badRequest("Mã khuyến mãi đã hết lượt sử dụng.");
        }

        long userUsageCount = promoUsageRepository.countByPromoIdAndUserId(promo.getId(), userId);
        if (userUsageCount > 0) {
            throw AppException.badRequest("Bạn đã sử dụng mã khuyến mãi này rồi.");
        }

        return promo;
    }

    @org.springframework.transaction.annotation.Transactional
    public PromoCode validateAndReservePromo(String code, Long userId, Long bookingId, Integer orderValue) {
        PromoCode promo = promoCodeRepository.findByCodeForUpdate(code)
                .orElseThrow(() -> AppException.notFound("Promo code not found."));

        if (promo.getStatus() != PromoStatus.Active) {
            throw AppException.badRequest("Promo code is inactive.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(promo.getValidFrom()) || now.isAfter(promo.getValidUntil())) {
            throw AppException.badRequest("Promo code has expired or is not yet valid.");
        }

        if (promo.getMinOrderValue() != null && orderValue < promo.getMinOrderValue()) {
            throw AppException.badRequest("Order total does not meet the minimum required amount of " + promo.getMinOrderValue() + " VND.");
        }

        if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
            throw AppException.badRequest("Promo code usage limit has been reached.");
        }

        long userUsageCount = promoUsageRepository.countByPromoIdAndUserId(promo.getId(), userId);
        if (userUsageCount > 0) {
            throw AppException.badRequest("You have already used this promo code.");
        }

        // Reserve the promo
        promo.setUsedCount(promo.getUsedCount() + 1);
        promoCodeRepository.save(promo);

        com.cinebook.backend.modules.promos.entity.PromoUsage usage = new com.cinebook.backend.modules.promos.entity.PromoUsage();
        usage.setPromoId(promo.getId());
        usage.setUserId(userId);
        usage.setBookingId(bookingId);
        promoUsageRepository.save(usage);

        return promo;
    }

    @org.springframework.transaction.annotation.Transactional
    public void releasePromoUsage(Long promoId, Long bookingId) {
        java.util.Optional<com.cinebook.backend.modules.promos.entity.PromoUsage> usageOpt = promoUsageRepository.findByBookingId(bookingId);
        if (usageOpt.isPresent()) {
            promoUsageRepository.deleteByBookingId(bookingId);
            promoCodeRepository.findById(promoId).ifPresent(promo -> {
                if (promo.getUsedCount() > 0) {
                    promo.setUsedCount(promo.getUsedCount() - 1);
                    promoCodeRepository.save(promo);
                }
            });
        }
    }

    public org.springframework.data.domain.Page<PromoCode> getAllPromos(org.springframework.data.domain.Pageable pageable) {
        return promoCodeRepository.findAll(pageable);
    }

    public PromoCode createPromo(PromoCode promoCode) {
        return promoCodeRepository.save(promoCode);
    }

    public PromoCode updatePromo(Long id, PromoCode promoDetails) {
        PromoCode promo = promoCodeRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Promo code not found."));

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
                .orElseThrow(() -> AppException.notFound("Promo code not found."));
        if (promo.getStatus() == PromoStatus.Active) {
            throw AppException.badRequest("Không thể xóa mã khuyến mãi đang hoạt động. Vui lòng vô hiệu hóa trước.");
        }
        promoCodeRepository.delete(promo);
    }

    public void recordUsage(Long promoId, Long userId, Long bookingId) {
        PromoCode promo = promoCodeRepository.findById(promoId)
                .orElseThrow(() -> AppException.notFound("Promo code not found."));
        
        promo.setUsedCount(promo.getUsedCount() + 1);
        promoCodeRepository.save(promo);

        com.cinebook.backend.modules.promos.entity.PromoUsage usage = new com.cinebook.backend.modules.promos.entity.PromoUsage();
        usage.setPromoId(promoId);
        usage.setUserId(userId);
        usage.setBookingId(bookingId);
        promoUsageRepository.save(usage);
    }

    public void expireOldPromos() {
        java.util.List<PromoCode> expiredPromos = promoCodeRepository.findByStatusAndValidUntilBefore(PromoStatus.Active, LocalDateTime.now());
        for (PromoCode promo : expiredPromos) {
            promo.setStatus(PromoStatus.Inactive);
            promoCodeRepository.save(promo);
        }
    }
}
