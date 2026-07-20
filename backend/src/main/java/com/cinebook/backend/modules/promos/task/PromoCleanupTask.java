package com.cinebook.backend.modules.promos.task;

import com.cinebook.backend.modules.promos.service.PromoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PromoCleanupTask {

    private final PromoService promoService;

    // Run every hour at the top of the hour (e.g., 01:00:00, 02:00:00)
    @Scheduled(cron = "0 0 * * * *")
    public void cleanupExpiredPromos() {
        log.info("Starting scheduled task: Cleanup expired promo codes...");
        try {
            promoService.expireOldPromos();
            log.info("Finished cleanup expired promo codes successfully.");
        } catch (Exception e) {
            log.error("Error during promo cleanup task: ", e);
        }
    }
}
