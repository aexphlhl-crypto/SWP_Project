package com.cinebook.backend.modules.bookings.repository;

import com.cinebook.backend.modules.bookings.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {
    java.util.List<BookingSeat> findByBooking_Id(Long bookingId);

    @org.springframework.data.jpa.repository.Query("SELECT bs FROM BookingSeat bs WHERE bs.booking.showtime.showtimeId = :showtimeId AND bs.booking.status IN (com.cinebook.backend.modules.bookings.entity.BookingStatus.Pending, com.cinebook.backend.modules.bookings.entity.BookingStatus.Confirmed, com.cinebook.backend.modules.bookings.entity.BookingStatus.CheckedIn)")
    java.util.List<BookingSeat> findBookedSeatsByShowtime(@org.springframework.data.repository.query.Param("showtimeId") Long showtimeId);
}
