package com.cinebook.backend.modules.resale.scheduler;

import com.cinebook.backend.modules.resale.repository.ResaleListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ResaleScheduler {

    private final ResaleListingRepository listingRepository;

    // Run every 15 minutes = 900,000 milliseconds
    @Scheduled(fixedRate = 900000)
    // @Scheduled(fixedRate = 60000) // Uncomment to run every minute for testing
    @Transactional
    public void hideExpiredResaleTickets() {
        LocalDateTime now = LocalDateTime.now();
        int updatedCount = listingRepository.updateStatusForExpiredShowtimes(now);
        if (updatedCount > 0) {
            log.info("Auto-hidden {} expired resale tickets where showtime has already started", updatedCount);
        }
    }
}
