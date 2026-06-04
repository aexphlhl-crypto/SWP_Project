package com.cinebook.backend.modules.rooms.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.rooms.dto.RoomRequest;
import com.cinebook.backend.modules.rooms.dto.RoomDto;
import com.cinebook.backend.modules.rooms.dto.SeatConfigDto;
import com.cinebook.backend.modules.rooms.entity.Seat;
import com.cinebook.backend.modules.rooms.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @GetMapping
    public ApiResponse<Page<RoomDto>> getAllRooms(Pageable pageable) {
        return ApiResponse.ok(roomService.getAllRooms(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<RoomDto> getRoomById(@PathVariable Long id) {
        return ApiResponse.ok(roomService.getRoomById(id));
    }

    @PostMapping
    public ApiResponse<RoomDto> createRoom(@RequestBody RoomRequest request) {
        return ApiResponse.ok(roomService.createRoom(request));
    }

    @GetMapping("/{id}/seats")
    public ApiResponse<List<Seat>> getRoomSeats(@PathVariable Long id) {
        return ApiResponse.ok(roomService.getSeatsByRoomId(id));
    }

    @PostMapping("/{id}/seats")
    public ApiResponse<List<Seat>> configureSeats(@PathVariable Long id, @RequestBody List<SeatConfigDto> seatConfigs) {
        return ApiResponse.ok(roomService.configureSeats(id, seatConfigs));
    }
}
