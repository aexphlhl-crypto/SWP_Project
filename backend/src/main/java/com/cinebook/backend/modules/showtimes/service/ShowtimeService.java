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

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

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
        return allSeats.stream().map(seat -> {
            boolean isBooked = bookedSeatIds.contains(seat.getSeatId());
            String status = isBooked ? "Booked" : "Available";
            Long heldByUserId = null;
            String holdExpiresAt = null;
            if ("Available".equals(status)) {
                java.util.Optional<SeatHold> hold = activeHolds.stream()
                        .filter(h -> h.getSeat().getSeatId().equals(seat.getSeatId()))
                        .findFirst();
                if (hold.isPresent()) {
                    status = "Held";
                    heldByUserId = hold.get().getUser().getUserId();
                    holdExpiresAt = hold.get().getExpiresAt().toString();
                }
            }

            return SeatStatusDto.builder()
                    .seatId(seat.getSeatId())
                    .rowLabel(seat.getRowLabel())
                    .colNumber(seat.getColNumber())
                    .seatLabel(seat.getSeatLabel())
                    .seatType(seat.getSeatType().name())
                    .status(status)
                    .heldByUserId(heldByUserId)
                    .holdExpiresAt(holdExpiresAt)
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

    @Transactional
    public void releaseAllHoldsForUser(Long showtimeId, String username) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        seatHoldRepository.deleteByShowtimeAndUser(showtimeId, user.getUserId());
    }

    private Integer calculateTicketPrice(Showtime showtime, Seat seat) {
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
        validateCinemaAccess(request.getCinemaId());
        
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

                .build();

        return mapToDto(showtimeRepository.save(showtime));
    }

    @Transactional
    public ShowtimeDto updateShowtime(Long id, ShowtimeRequest request) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));

        validateCinemaAccess(showtime.getCinema().getCinemaId());
        
        // Kiểm tra xem đã có vé nào được đặt cho suất chiếu này chưa
        int bookedCount = bookingSeatRepository.findBookedSeatsByShowtime(id).size();
        if (bookedCount > 0) {
            throw AppException.badRequest("Không thể chỉnh sửa suất chiếu đã có vé bán.");
        }

        Movie targetMovie = showtime.getMovie();
        if (request.getMovieId() != null) {
            targetMovie = movieRepository.findById(request.getMovieId())
                    .orElseThrow(() -> new RuntimeException("Movie not found"));
            showtime.setMovie(targetMovie);
        }
        if (request.getCinemaId() != null) {
            validateCinemaAccess(request.getCinemaId());
            Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                    .orElseThrow(() -> new RuntimeException("Cinema not found"));
            showtime.setCinema(cinema);
        }
        Room targetRoom = showtime.getRoom();
        if (request.getRoomId() != null) {
            targetRoom = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
            showtime.setRoom(targetRoom);
        }
        LocalDateTime targetStartTime = showtime.getStartTime();
        if (request.getStartTime() != null) {
            targetStartTime = request.getStartTime();
            if (targetStartTime.isBefore(LocalDateTime.now())) {
                throw AppException.badRequest("Không thể cập nhật suất chiếu sang thời gian trong quá khứ.");
            }
            showtime.setStartTime(targetStartTime);
        }

        // Cập nhật EndTime dựa trên Movie mới/cũ và StartTime mới/cũ
        LocalDateTime targetEndTime = targetStartTime.plusMinutes(targetMovie.getDurationMin());
        showtime.setEndTime(targetEndTime);
        LocalDateTime targetEndTimeWithBuffer = targetEndTime.plusMinutes(15);

        // Kiểm tra conflict trùng lịch
        boolean conflict = showtimeRepository.existsConflictingShowtimeForUpdate(
                targetRoom.getRoomId(), 
                id, 
                targetStartTime, 
                targetEndTimeWithBuffer
        );
        if (conflict) {
            throw AppException.badRequest("Lịch chiếu này bị trùng thời gian với một lịch chiếu khác trong cùng phòng.");
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

        validateCinemaAccess(showtime.getCinema().getCinemaId());

        // Kiểm tra xem đã có vé nào được đặt cho suất chiếu này chưa
        int bookedCount = bookingSeatRepository.findBookedSeatsByShowtime(id).size();
        if (bookedCount > 0) {
            throw AppException.badRequest("Không thể xóa suất chiếu đã có vé bán.");
        }

        showtime.setStatus("Cancelled");
        showtimeRepository.save(showtime);
    }

    private void validateCinemaAccess(Long cinemaId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            boolean isSystemAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_SystemAdmin"));
            if (isSystemAdmin) {
                return;
            }
            boolean isScheduleManager = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ScheduleManager"));
            if (isScheduleManager) {
                String email = auth.getName();
                com.cinebook.backend.modules.users.User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                        .orElseThrow(() -> AppException.unauthorized("User not found"));
                if (user.getCinema() == null || !user.getCinema().getCinemaId().equals(cinemaId)) {
                    throw AppException.forbidden("You do not have permission to manage showtimes for this cinema.");
                }
            }
        }
    }
}
