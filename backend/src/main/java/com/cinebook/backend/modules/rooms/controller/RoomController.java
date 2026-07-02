package com.cinebook.backend.modules.rooms.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.rooms.dto.RoomRequest;
import com.cinebook.backend.modules.rooms.dto.RoomDto;
import com.cinebook.backend.modules.rooms.dto.SeatConfigDto;
import com.cinebook.backend.modules.rooms.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @GetMapping
    public ApiResponse<Page<RoomDto>> getAllRooms(
            @RequestParam(required = false) Long cinemaId,
            Pageable pageable) {
        return ApiResponse.ok(roomService.getAllRooms(cinemaId, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<RoomDto> getRoomById(@PathVariable Long id) {
        return ApiResponse.ok(roomService.getRoomById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<RoomDto> createRoom(@RequestBody RoomRequest request) {
        return ApiResponse.ok(roomService.createRoom(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<RoomDto> updateRoomStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ApiResponse.ok(roomService.updateRoomStatus(id, body.get("status")));
    }

    @GetMapping("/{id}/seats")
    public ApiResponse<List<SeatConfigDto>> getRoomSeats(@PathVariable Long id) {
        return ApiResponse.ok(roomService.getSeatsByRoomId(id));
    }

    @PostMapping("/{id}/seats")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<List<SeatConfigDto>> configureSeats(@PathVariable Long id,
                                                            @RequestBody List<SeatConfigDto> seatConfigs) {
        return ApiResponse.ok(roomService.configureSeats(id, seatConfigs));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<String> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ApiResponse.ok("Room deleted successfully");
    }
}

