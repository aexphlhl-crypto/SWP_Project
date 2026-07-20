package com.cinebook.backend.modules.showtimes.repository;

import com.cinebook.backend.modules.showtimes.entity.SeatHold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatHoldRepository extends JpaRepository<SeatHold, Long> {

    @Transactional
    @Modifying
    @Query("DELETE FROM SeatHold sh WHERE sh.showtime.showtimeId = :showtimeId AND sh.user.userId = :userId")
    void deleteByShowtimeAndUser(@Param("showtimeId") Long showtimeId, @Param("userId") Long userId);

    @Query("SELECT sh FROM SeatHold sh WHERE sh.showtime.showtimeId = :showtimeId AND sh.expiresAt > :now")
    List<SeatHold> findActiveHoldsByShowtime(@Param("showtimeId") Long showtimeId, @Param("now") LocalDateTime now);

    @Query("SELECT sh FROM SeatHold sh WHERE sh.showtime.showtimeId = :showtimeId AND sh.seat.seatId = :seatId AND sh.expiresAt > :now")
    Optional<SeatHold> findActiveHoldBySeat(@Param("showtimeId") Long showtimeId, @Param("seatId") Long seatId, @Param("now") LocalDateTime now);

    @Transactional
    @Modifying
    @Query("DELETE FROM SeatHold sh WHERE sh.showtime.showtimeId = :showtimeId AND sh.seat.seatId = :seatId AND sh.user.userId = :userId")
    void deleteUserHold(@Param("showtimeId") Long showtimeId, @Param("seatId") Long seatId, @Param("userId") Long userId);

    @Transactional
    @Modifying
    @Query("DELETE FROM SeatHold sh WHERE sh.expiresAt <= :now")
    void deleteExpiredHolds(@Param("now") LocalDateTime now);
}
