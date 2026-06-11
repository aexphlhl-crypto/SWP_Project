package com.cinebook.backend.modules.bookings.repository;

import com.cinebook.backend.modules.bookings.entity.Booking;
import com.cinebook.backend.modules.bookings.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStatusAndHoldExpiresAtBefore(BookingStatus status, LocalDateTime now);

    int countByCustomer_UserIdAndStatus(Long customerId, BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAfterTax), 0) FROM Booking b WHERE b.customer.userId = :customerId AND b.status = :status")
    Integer sumTotalAfterTaxByCustomerIdAndStatus(@org.springframework.data.repository.query.Param("customerId") Long customerId, @org.springframework.data.repository.query.Param("status") BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAfterTax), 0) FROM Booking b WHERE b.status IN :statuses")
    Integer sumTotalAfterTaxByStatusIn(@org.springframework.data.repository.query.Param("statuses") List<BookingStatus> statuses);

    @Query("SELECT COALESCE(SUM(b.totalTicketsAmount), 0) FROM Booking b WHERE b.status IN :statuses")
    Integer sumTotalTicketsAmountByStatusIn(@org.springframework.data.repository.query.Param("statuses") List<BookingStatus> statuses);

    List<Booking> findByCustomer_UserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByCustomer_UserIdAndStatusInOrderByCreatedAtDesc(Long userId, List<BookingStatus> statuses);

    List<Booking> findByStatusInAndCreatedAtBetween(List<BookingStatus> statuses, LocalDateTime start, LocalDateTime end);

    List<Booking> findByStatusInOrderByCreatedAtDesc(List<BookingStatus> statuses);

    org.springframework.data.domain.Page<Booking> findAllByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT m.movieId, m.title, SUM(b.totalAfterTax) " +
           "FROM Booking b " +
           "JOIN b.showtime s " +
           "JOIN s.movie m " +
           "WHERE b.status IN :statuses " +
           "GROUP BY m.movieId, m.title " +
           "ORDER BY SUM(b.totalAfterTax) DESC")
    List<Object[]> findTopMoviesByRevenue(@org.springframework.data.repository.query.Param("statuses") List<BookingStatus> statuses, org.springframework.data.domain.Pageable pageable);
}
