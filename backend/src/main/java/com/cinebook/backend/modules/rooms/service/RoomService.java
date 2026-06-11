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

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final CinemaRepository cinemaRepository;

    @Transactional(readOnly = true)
    public Page<RoomDto> getAllRooms(Pageable pageable) {
        return roomRepository.findAll(pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public RoomDto getRoomById(Long id) {
        return roomRepository.findById(id).map(this::mapToDto)
            .orElseThrow(() -> new RuntimeException("Room not found"));
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
                .roomType(room.getRoomType())
                .status(room.getStatus())
                .build();
    }

    @Transactional
    public RoomDto createRoom(RoomRequest request) {
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new RuntimeException("Cinema not found"));

        Integer capacity = request.getRows() * request.getColumns();

        Room room = Room.builder()
                .cinema(cinema)
                .name(request.getName())
                .rows(request.getRows())
                .columns(request.getColumns())
                .capacity(capacity)
                .baseNormalPrice(request.getBaseNormalPrice() != null ? request.getBaseNormalPrice() : 0)
                .roomType(request.getRoomType() != null ? request.getRoomType() : "2D")
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
                .orElseThrow(() -> new RuntimeException("Room not found"));
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
                .orElseThrow(() -> new RuntimeException("Room not found"));

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
                throw AppException.badRequest("Không thể xóa hoặc ẩn một số ghế vì các ghế đó đã được khách đặt vé hoặc đang giữ chỗ.");
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
}
