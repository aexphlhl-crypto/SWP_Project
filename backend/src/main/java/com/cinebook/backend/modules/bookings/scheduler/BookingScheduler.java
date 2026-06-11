package com.cinebook.backend.modules.bookings.scheduler;

import com.cinebook.backend.modules.bookings.entity.Booking;
import com.cinebook.backend.modules.bookings.entity.BookingStatus;
import com.cinebook.backend.modules.bookings.repository.BookingRepository;
import com.cinebook.backend.modules.showtimes.repository.SeatHoldRepository;
import com.cinebook.backend.modules.notifications.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingScheduler {

    private final BookingRepository bookingRepository;
    private final SeatHoldRepository seatHoldRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expirePendingBookings() {
        LocalDateTime now = LocalDateTime.now();
        seatHoldRepository.deleteExpiredHolds(now);
        List<Booking> pendingBookings = bookingRepository.findByStatusAndHoldExpiresAtBefore(BookingStatus.Pending, now);
        
        if (!pendingBookings.isEmpty()) {
            log.info("Found {} pending bookings to expire", pendingBookings.size());
            for (Booking booking : pendingBookings) {
                booking.setStatus(BookingStatus.Expired);
                
                String notificationTitle = "Hủy đơn đặt vé";
                String notificationMessage = String.format("Đơn vé xem phim %s (Mã BK%03d) của bạn đã bị hủy do quá thời gian thanh toán.",
                        booking.getShowtime().getMovie().getTitle(), booking.getId());
                notificationService.createNotification(booking.getCustomer().getUserId(), notificationTitle, notificationMessage);
            }
            bookingRepository.saveAll(pendingBookings);
        }
    }
}
