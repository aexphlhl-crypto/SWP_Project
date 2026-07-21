package com.cinebook.backend.modules.promos;

import com.cinebook.backend.modules.promos.entity.PromoCode;
import com.cinebook.backend.modules.promos.entity.PromoDiscountType;
import com.cinebook.backend.modules.promos.entity.PromoStatus;
import com.cinebook.backend.modules.promos.repository.PromoCodeRepository;
import com.cinebook.backend.modules.promos.repository.PromoUsageRepository;
import com.cinebook.backend.modules.promos.service.PromoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PromoServiceTest {

    @Mock
    private PromoCodeRepository promoCodeRepository;

    @Mock
    private PromoUsageRepository promoUsageRepository;

    @InjectMocks
    private PromoService promoService;

    private PromoCode promo;

    @BeforeEach
    void setUp() {
        promo = new PromoCode();
        promo.setId(1L);
        promo.setCode("TEST100");
        promo.setStatus(PromoStatus.Active);
        promo.setValidFrom(LocalDateTime.now().minusDays(1));
        promo.setValidUntil(LocalDateTime.now().plusDays(1));
        promo.setMinOrderValue(100000);
        promo.setUsageLimit(5);
        promo.setUsedCount(0);
        promo.setDiscountType(PromoDiscountType.FixedAmount);
        promo.setDiscountValue(new BigDecimal("50000"));
    }

    @Test
    void validatePromo_Success() {
        when(promoCodeRepository.findByCode("TEST100")).thenReturn(Optional.of(promo));
        when(promoUsageRepository.countByPromoIdAndUserId(1L, 1L)).thenReturn(0L);

        assertDoesNotThrow(() -> {
            PromoCode validatedPromo = promoService.validatePromo("TEST100", 1L, 150000);
            assertEquals("TEST100", validatedPromo.getCode());
        });
    }

    @Test
    void validatePromo_Failed_Expired() {
        promo.setValidUntil(LocalDateTime.now().minusHours(1));
        when(promoCodeRepository.findByCode("TEST100")).thenReturn(Optional.of(promo));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            promoService.validatePromo("TEST100", 1L, 150000);
        });
        assertTrue(exception.getMessage().contains("expired"));
    }

    @Test
    void validatePromo_Failed_UsageLimitReached() {
        promo.setUsedCount(5);
        when(promoCodeRepository.findByCode("TEST100")).thenReturn(Optional.of(promo));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            promoService.validatePromo("TEST100", 1L, 150000);
        });
        assertTrue(exception.getMessage().contains("limit exceeded"));
    }

    @Test
    void validatePromo_Failed_AlreadyUsedByUser() {
        when(promoCodeRepository.findByCode("TEST100")).thenReturn(Optional.of(promo));
        when(promoUsageRepository.countByPromoIdAndUserId(1L, 1L)).thenReturn(1L);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            promoService.validatePromo("TEST100", 1L, 150000);
        });
        assertTrue(exception.getMessage().contains("already used"));
    }
}
