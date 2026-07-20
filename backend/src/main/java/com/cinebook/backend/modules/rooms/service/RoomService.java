package com.cinebook.backend.modules.rooms.service;

import com.cinebook.backend.modules.cinemas.entity.Cinema;
import com.cinebook.backend.modules.cinemas.repository.CinemaRepository;
import com.cinebook.backend.modules.rooms.dto.RoomRequest;
import com.cinebook.backend.modules.rooms.dto.RoomDto;
import com.cinebook.backend.modules.rooms.dto.SeatConfigDto;
import com.cinebook.backend.modules.rooms.entity.Room;
import com.cinebook.backend.modules.rooms.entity.Seat;
import com.cinebook.backend.modules.rooms.entity.SeatType;
import com.cinebook.backend.modules.rooms.repository.RoomRepository;
import com.cinebook.backend.modules.rooms.repository.SeatRepository;
import com.cinebook.backend.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Collection;
import java.util.stream.Collectors;

import com.cinebook.backend.modules.users.UserRepository;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final CinemaRepository cinemaRepository;
    private final UserRepository userRepository;
    private final com.cinebook.backend.modules.bookings.repository.BookingRepository bookingRepository;
    private final com.cinebook.backend.modules.showtimes.repository.ShowtimeRepository showtimeRepository;

    @Transactional(readOnly = true)
    public Page<RoomDto> getAllRooms(Long cinemaId, Pageable pageable) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            boolean isScheduleManager = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ScheduleManager"));
            if (isScheduleManager) {
                String email = auth.getName();
                com.cinebook.backend.modules.users.User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                        .orElseThrow(() -> AppException.unauthorized("User not found"));
                if (user.getCinema() != null) {
                    cinemaId = user.getCinema().getCinemaId();
                } else {
                    return Page.empty(pageable);
                }
            }
        }

        if (cinemaId != null) {
            return roomRepository.findByCinemaCinemaId(cinemaId, pageable).map(this::mapToDto);
        }
        return roomRepository.findAll(pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public RoomDto getRoomById(Long id) {
        return roomRepository.findById(id).map(this::mapToDto)
            .orElseThrow(() -> AppException.notFound("Room not found."));
    }

    private RoomDto mapToDto(Room room) {
        return RoomDto.builder()
                .roomId(room.getRoomId())
                .cinemaId(room.getCinema().getCinemaId())
                .cinemaName(room.getCinema().getName())
                .name(room.getName())
                .rows(room.getRows())
                .columns(room.getColumns())
                .capacity(room.getCapacity())
                .baseNormalPrice(room.getBaseNormalPrice())
                .status(room.getStatus())
                .build();
    }

    private void validateCinemaAccess(Long cinemaId) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
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
                if (user.getCinema() != null && !user.getCinema().getCinemaId().equals(cinemaId)) {
                    throw AppException.forbidden("You do not have permission to manage rooms for this cinema.");
                }
            }
        }
    }

    @Transactional
    public RoomDto createRoom(RoomRequest request) {
        validateCinemaAccess(request.getCinemaId());
        
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> AppException.notFound("Cinema not found."));

        Integer capacity = request.getRows() * request.getColumns();

        Room room = Room.builder()
                .cinema(cinema)
                .name(request.getName())
                .rows(request.getRows())
                .columns(request.getColumns())
                .capacity(capacity)
                .baseNormalPrice(request.getBaseNormalPrice() != null ? request.getBaseNormalPrice() : 0)
                .status(request.getStatus() != null ? request.getStatus() : "Active")
                .build();
        
        room = roomRepository.save(room);

        List<Seat> seats = new ArrayList<>();
        for (int i = 0; i < request.getRows(); i++) {
            char rowChar = (char) ('A' + i);
            String rowLabel = String.valueOf(rowChar);
            for (int j = 1; j <= request.getColumns(); j++) {
                String seatLabel = rowLabel + j;
                Seat seat = Seat.builder()
                        .room(room)
                        .rowLabel(rowLabel)
                        .colNumber(j)
                        .seatLabel(seatLabel)
                        .seatType(SeatType.Normal) // Default to normal
                        .build();
                seats.add(seat);
            }
        }
        seatRepository.saveAll(seats);

        return mapToDto(room);
    }

    @Transactional
    public RoomDto updateRoomStatus(Long id, String status) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Room not found."));
        validateCinemaAccess(room.getCinema().getCinemaId());
        room.setStatus(status);
        roomRepository.save(room);
        return mapToDto(room);
    }

    @Transactional(readOnly = true)
    public List<SeatConfigDto> getSeatsByRoomId(Long roomId) {
        return seatRepository.findByRoomRoomId(roomId).stream()
                .map(this::mapSeatToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<SeatConfigDto> configureSeats(Long roomId, List<SeatConfigDto> seatConfigs) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> AppException.notFound("Room not found."));
        validateCinemaAccess(room.getCinema().getCinemaId());

        if (!"UnderMaintenance".equals(room.getStatus()) && !"Inactive".equals(room.getStatus())) {
            throw AppException.badRequest("Seat layout can only be configured when the room is Under Maintenance or Inactive.");
        }

        // Load existing seats
        List<Seat> existingSeats = seatRepository.findByRoomRoomId(roomId);
        Map<String, Seat> existingSeatMap = existingSeats.stream()
                .collect(Collectors.toMap(s -> s.getRowLabel() + "_" + s.getColNumber(), s -> s, (s1, s2) -> s1));

        List<Seat> seatsToSave = new ArrayList<>();

        // Match, update or insert seats
        for (SeatConfigDto dto : seatConfigs) {
            String key = dto.getRowLabel() + "_" + dto.getColNumber();
            if (existingSeatMap.containsKey(key)) {
                Seat seat = existingSeatMap.remove(key);
                seat.setSeatType(dto.getSeatType());
                seat.setSeatLabel(dto.getSeatLabel());
                seatsToSave.add(seat);
            } else {
                Seat seat = Seat.builder()
                        .room(room)
                        .rowLabel(dto.getRowLabel())
                        .colNumber(dto.getColNumber())
                        .seatLabel(dto.getSeatLabel())
                        .seatType(dto.getSeatType())
                        .build();
                seatsToSave.add(seat);
            }
        }

        // The remaining seats in the map are those that were deleted/hidden
        Collection<Seat> seatsToDelete = existingSeatMap.values();
        if (!seatsToDelete.isEmpty()) {
            try {
                seatRepository.deleteAll(seatsToDelete);
                seatRepository.flush();
            } catch (Exception e) {
                throw AppException.badRequest("Cannot remove seats that have active bookings or holds.");
            }
        }

        List<Seat> savedSeats = seatRepository.saveAll(seatsToSave);
        return savedSeats.stream().map(this::mapSeatToDto).collect(Collectors.toList());
    }

    private SeatConfigDto mapSeatToDto(Seat seat) {
        SeatConfigDto dto = new SeatConfigDto();
        dto.setRowLabel(seat.getRowLabel());
        dto.setColNumber(seat.getColNumber());
        dto.setSeatLabel(seat.getSeatLabel());
        dto.setSeatType(seat.getSeatType());
        return dto;
    }

    @Transactional
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Room not found."));
        validateCinemaAccess(room.getCinema().getCinemaId());
        boolean hasBookings = bookingRepository.existsByShowtimeRoomRoomId(id);
        if (hasBookings) {
            throw AppException.badRequest("Không thể xóa phòng chiếu này vì đã có vé được đặt.");
        }
        showtimeRepository.deleteByRoomId(id);
        roomRepository.delete(room);
    }
}
