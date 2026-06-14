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
import com.cinebook.backend.modules.showtimes.repository.SeatHoldRepository;
import com.cinebook.backend.modules.showtimes.entity.SeatHold;
import com.cinebook.backend.modules.users.UserRepository;
import com.cinebook.backend.modules.users.User;
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
    private final SeatHoldRepository seatHoldRepository;
    private final UserRepository userRepository;
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
        int bookedCount = bookingSeatRepository.findBookedSeatsByShowtime(s.getShowtimeId()).size();
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
                .totalSeats(s.getRoom().getCapacity())
                .availableSeats(s.getRoom().getCapacity() - bookedCount)
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

        List<SeatHold> activeHolds = seatHoldRepository.findActiveHoldsByShowtime(showtimeId, LocalDateTime.now());
        java.util.Map<Long, Long> heldSeatMap = activeHolds.stream()
                .collect(Collectors.toMap(h -> h.getSeat().getSeatId(), h -> h.getUser().getUserId()));

        return allSeats.stream().map(seat -> {
            boolean isBooked = bookedSeatIds.contains(seat.getSeatId());
            String status = "Available";
            Long heldByUserId = null;

            if (isBooked) {
                status = "Booked";
            } else if (heldSeatMap.containsKey(seat.getSeatId())) {
                status = "Held";
                heldByUserId = heldSeatMap.get(seat.getSeatId());
            }

            return SeatStatusDto.builder()
                    .seatId(seat.getSeatId())
                    .rowLabel(seat.getRowLabel())
                    .colNumber(seat.getColNumber())
                    .seatLabel(seat.getSeatLabel())
                    .seatType(seat.getSeatType().name())
                    .status(status)
                    .heldByUserId(heldByUserId)
                    .price(calculateTicketPrice(showtime, seat))
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void holdSeat(Long showtimeId, Long seatId, String username) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));
        User user = userRepository.findByEmailAndDeletedAtIsNull(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if booked
        List<BookingSeat> bookedSeats = bookingSeatRepository.findBookedSeatsByShowtime(showtimeId);
        if (bookedSeats.stream().anyMatch(bs -> bs.getSeat().getSeatId().equals(seatId))) {
            throw AppException.badRequest("Ghế này đã được người khác đặt.");
        }

        // Check if held by someone else
        java.util.Optional<SeatHold> existingHold = seatHoldRepository.findActiveHoldBySeat(showtimeId, seatId, LocalDateTime.now());
        if (existingHold.isPresent() && !existingHold.get().getUser().getUserId().equals(user.getUserId())) {
            throw AppException.badRequest("Ghế này đang được người khác giữ.");
        }

        // Create or update hold
        int holdMinutes = systemConfigService.getSeatHoldMinutes();
        if (existingHold.isEmpty()) {
            SeatHold newHold = SeatHold.builder()
                    .showtime(showtime)
                    .seat(seat)
                    .user(user)
                    .expiresAt(LocalDateTime.now().plusMinutes(holdMinutes))
                    .build();
            seatHoldRepository.save(newHold);
        } else {
            // Refresh hold
            SeatHold hold = existingHold.get();
            hold.setExpiresAt(LocalDateTime.now().plusMinutes(holdMinutes));
            seatHoldRepository.save(hold);
        }
    }

    @Transactional
    public void releaseSeat(Long showtimeId, Long seatId, String username) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        seatHoldRepository.deleteUserHold(showtimeId, seatId, user.getUserId());
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
        if (startTime == null) {
            throw AppException.badRequest("Thời gian bắt đầu không được để trống.");
        }
        if (startTime.isBefore(LocalDateTime.now())) {
            throw AppException.badRequest("Không thể tạo suất chiếu ở thời gian trong quá khứ.");
        }
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
            if (request.getStartTime().isBefore(LocalDateTime.now())) {
                throw AppException.badRequest("Không thể cập nhật suất chiếu sang thời gian trong quá khứ.");
            }
            showtime.setStartTime(request.getStartTime());
            showtime.setEndTime(request.getStartTime().plusMinutes(showtime.getMovie().getDurationMin()));
        }
        if (request.getPriceOverride() != null) {
            showtime.setPriceOverride(request.getPriceOverride());
        }
        if (request.getStatus() != null) {
            showtime.setStatus(request.getStatus());
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
