package com.cinebook.backend.modules.resale.repository;

import com.cinebook.backend.modules.resale.entity.TicketExchangeListing;
import com.cinebook.backend.modules.resale.entity.ListingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResaleListingRepository extends JpaRepository<TicketExchangeListing, Long> {
    Page<TicketExchangeListing> findByStatus(ListingStatus status, Pageable pageable);
    Page<TicketExchangeListing> findBySellerId(Long sellerId, Pageable pageable);
    boolean existsByBookingIdAndStatusIn(Long bookingId, java.util.Collection<ListingStatus> statuses);
    java.util.List<TicketExchangeListing> findByBookingIdAndStatusIn(Long bookingId, java.util.Collection<ListingStatus> statuses);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE TicketExchangeListing t SET t.status = com.cinebook.backend.modules.resale.entity.ListingStatus.Hidden, t.hiddenReason = 'Showtime has already started', t.hiddenAt = CURRENT_TIMESTAMP WHERE t.status = com.cinebook.backend.modules.resale.entity.ListingStatus.Active AND t.bookingId IN (SELECT b.id FROM com.cinebook.backend.modules.bookings.entity.Booking b JOIN b.showtime s WHERE s.startTime <= :currentTime)")
    int updateStatusForExpiredShowtimes(@org.springframework.data.repository.query.Param("currentTime") java.time.LocalDateTime currentTime);
}
