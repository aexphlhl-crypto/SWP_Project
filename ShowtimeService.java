package com.cinebook.backend.modules.showtimes.service;

import com.cinebook.backend.modules.cinemas.entity.Cinema;
import com.cinebook.backend.modules.cinemas.repository.CinemaRepository;
import com.cinebook.backend.modules.movies.entity.Movie;
import com.cinebook.backend.modules.movies.repository.MovieRepository;
import com.cinebook.backend.modules.rooms.entity.Room;
import com.cinebook.backend.modules.rooms.repository.RoomRepository;
import com.cinebook.backend.modules.showtimes.dto.ShowtimeRequest;
import com.cinebook.backend.modules.showtimes.dto.ShowtimeDto;
import com.cinebook.backend.modules.showtimes.dto.SeatStatusDto;
import com.cinebook.backend.modules.showtimes.entity.Showtime;
import com.cinebook.backend.modules.showtimes.repository.ShowtimeRepository;
import com.cinebook.backend.common.exception.AppException;
import org.springframework.http.HttpStatus;
import com.cinebook.backend.modules.rooms.repository.SeatRepository;
import com.cinebook.backend.modules.rooms.entity.Seat;
import com.cinebook.backend.modules.bookings.repository.BookingSeatRepository;
import com.cinebook.backend.modules.bookings.entity.BookingSeat;
import com.cinebook.backend.modules.config.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowtimeService {
    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final CinemaRepository cinemaRepository;
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final SystemConfigService systemConfigService;

    @Transactional(readOnly = true)
    public Page<ShowtimeDto> getAllShowtimes(Long movieId, Long cinemaId, java.time.LocalDate date, Pageable pageable) {
        LocalDateTime startDate = null;
        LocalDateTime endDate = null;
        if (date != null) {
            startDate = date.atStartOfDay();
            endDate = startDate.plusDays(1);
        }
        return showtimeRepository.findFilteredShowtimes(movieId, cinemaId, startDate, endDate, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public ShowtimeDto getShowtimeById(Long id) {
        return showtimeRepository.findById(id).map(this::mapToDto)
            .orElseThrow(() -> new RuntimeException("Showtime not found"));
    }

    private ShowtimeDto mapToDto(Showtime s) {
        int booked = bookingSeatRepository.countBookedSeatsByShowtime(s.getShowtimeId());
        int capacity = s.getRoom().getCapacity();
        double occupancy = capacity > 0 ? ((double) booked / capacity) * 100 : 0.0;
        return ShowtimeDto.builder()
                .showtimeId(s.getShowtimeId())
                .movieId(s.getMovie().getMovieId())
                .movieTitle(s.getMovie().getTitle())
                .cinemaId(s.getCinema().getCinemaId())
                .cinemaName(s.getCinema().getName())
                .roomId(s.getRoom().getRoomId())
                .roomName(s.getRoom().getName())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .priceOverride(s.getPriceOverride())
                .status(s.getStatus())
                .totalSeats(capacity)
                .availableSeats(capacity - booked)
                .occupancyRate(Math.round(occupancy * 100.0) / 100.0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<SeatStatusDto> getSeatsByShowtime(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
        
        List<Seat> allSeats = seatRepository.findByRoomRoomId(showtime.getRoom().getRoomId());
        
        List<BookingSeat> bookedSeats = bookingSeatRepository.findBookedSeatsByShowtime(showtimeId);
        Set<Long> bookedSeatIds = bookedSeats.stream()
                .map(bs -> bs.getSeat().getSeatId())
                .collect(Collectors.toSet());

        return allSeats.stream().map(seat -> {
            boolean isBooked = bookedSeatIds.contains(seat.getSeatId());
            return SeatStatusDto.builder()
                    .seatId(seat.getSeatId())
                    .rowLabel(seat.getRowLabel())
                    .colNumber(seat.getColNumber())
                    .seatLabel(seat.getSeatLabel())
                    .seatType(seat.getSeatType().name())
                    .status(isBooked ? "Booked" : "Available")
                    .price(calculateTicketPrice(showtime, seat))
                    .build();
        }).collect(Collectors.toList());
    }

    private Integer calculateTicketPrice(Showtime showtime, Seat seat) {
        if (showtime.getPriceOverride() != null) {
            return showtime.getPriceOverride();
        }

        BigDecimal basePrice = systemConfigService.getBasePrice();
        
        // Seat Multiplier
        BigDecimal seatMultiplier = BigDecimal.ONE;
        if ("VIP".equalsIgnoreCase(seat.getSeatType().name())) {
            seatMultiplier = systemConfigService.getSeatVipMultiplier();
        } else if ("COUPLE".equalsIgnoreCase(seat.getSeatType().name())) {
            seatMultiplier = systemConfigService.getSeatCoupleMultiplier();
        }

        // Day Multiplier
        BigDecimal dayMultiplier = BigDecimal.ONE;
        DayOfWeek dayOfWeek = showtime.getStartTime().getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            dayMultiplier = BigDecimal.ONE.add(systemConfigService.getWeekendSurchargePercent().divide(BigDecimal.valueOf(100)));
        }

        // Time Multiplier
        BigDecimal timeMultiplier = BigDecimal.ONE;
        String eveningTimeStr = systemConfigService.getEveningSurchargeTime();
        LocalTime eveningTime = LocalTime.parse(eveningTimeStr);
        if (!showtime.getStartTime().toLocalTime().isBefore(eveningTime)) {
            timeMultiplier = BigDecimal.ONE.add(systemConfigService.getEveningSurchargePercent().divide(BigDecimal.valueOf(100)));
        }

        BigDecimal finalPrice = basePrice.multiply(seatMultiplier).multiply(dayMultiplier).multiply(timeMultiplier);
        return finalPrice.intValue();
    }

    @Transactional
    public ShowtimeDto createShowtime(ShowtimeRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new RuntimeException("Cinema not found"));
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = startTime.plusMinutes(movie.getDurationMin());
        LocalDateTime endTimeWithBuffer = endTime.plusMinutes(15);

        boolean conflict = showtimeRepository.existsConflictingShowtime(room.getRoomId(), startTime, endTimeWithBuffer);
        if (conflict) {
            throw AppException.badRequest("Lịch chiếu này bị trùng thời gian với một lịch chiếu khác trong cùng phòng.");
        }

        Showtime showtime = Showtime.builder()
                .movie(movie)
                .cinema(cinema)
                .room(room)
                .startTime(startTime)
                .endTime(endTime)
                .priceOverride(request.getPriceOverride())
                .build();

        return mapToDto(showtimeRepository.save(showtime));
    }

    @Transactional
    public ShowtimeDto updateShowtime(Long id, ShowtimeRequest request) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));

        if (request.getMovieId() != null) {
            Movie movie = movieRepository.findById(request.getMovieId())
                    .orElseThrow(() -> new RuntimeException("Movie not found"));
            showtime.setMovie(movie);
        }
        if (request.getCinemaId() != null) {
            Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                    .orElseThrow(() -> new RuntimeException("Cinema not found"));
            showtime.setCinema(cinema);
        }
        if (request.getRoomId() != null) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
            showtime.setRoom(room);
        }
        if (request.getStartTime() != null) {
            showtime.setStartTime(request.getStartTime());
            showtime.setEndTime(request.getStartTime().plusMinutes(showtime.getMovie().getDurationMin()));
        }
        if (request.getPriceOverride() != null) {
            showtime.setPriceOverride(request.getPriceOverride());
        }
        if (request.getStatus() != null) {
            showtime.setStatus(request.getStatus());
        }

        // Check scheduling conflicts for active/scheduled showtime
        if (!"Cancelled".equalsIgnoreCase(showtime.getStatus())) {
            LocalDateTime startTime = showtime.getStartTime();
            LocalDateTime endTime = showtime.getEndTime();
            LocalDateTime endTimeWithBuffer = endTime.plusMinutes(15);
            boolean conflict = showtimeRepository.existsConflictingShowtimeExcludingId(
                    showtime.getRoom().getRoomId(), startTime, endTimeWithBuffer, showtime.getShowtimeId());
            if (conflict) {
                throw AppException.badRequest("Lịch chiếu này bị trùng thời gian với một lịch chiếu khác trong cùng phòng.");
            }
        }
        
        return mapToDto(showtimeRepository.save(showtime));
    }

    @Transactional
    public void deleteShowtime(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
        showtime.setStatus("Cancelled");
        showtimeRepository.save(showtime);
    }
}
