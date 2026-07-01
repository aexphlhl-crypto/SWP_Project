package com.cinebook.backend.modules.showtimes.repository;

import com.cinebook.backend.modules.showtimes.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    @Query("SELECT COUNT(s) > 0 FROM Showtime s WHERE s.room.roomId = :roomId AND s.status = 'Scheduled' AND (s.startTime < :endTime AND s.endTime > :startTime)")
    boolean existsConflictingShowtime(@Param("roomId") Long roomId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @Query("SELECT s FROM Showtime s WHERE " +
           "s.status = 'Scheduled' AND " +
           "(:movieId IS NULL OR s.movie.movieId = :movieId) AND " +
           "(:cinemaId IS NULL OR s.cinema.cinemaId = :cinemaId) AND " +
           "(:startDate IS NULL OR s.startTime >= :startDate) AND " +
           "(:endDate IS NULL OR s.startTime < :endDate)")
    org.springframework.data.domain.Page<Showtime> findFilteredShowtimes(
            @Param("movieId") Long movieId, 
            @Param("cinemaId") Long cinemaId, 
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate, 
            org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COUNT(s) > 0 FROM Showtime s WHERE s.room.roomId = :roomId AND s.showtimeId != :excludeShowtimeId AND s.status = 'Scheduled' AND (s.startTime < :endTime AND s.endTime > :startTime)")
    boolean existsConflictingShowtimeForUpdate(@Param("roomId") Long roomId, @Param("excludeShowtimeId") Long excludeShowtimeId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}
