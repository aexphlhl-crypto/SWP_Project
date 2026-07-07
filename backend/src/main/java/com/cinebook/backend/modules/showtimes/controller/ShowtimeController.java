package com.cinebook.backend.modules.showtimes.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.showtimes.dto.ShowtimeDto;
import com.cinebook.backend.modules.showtimes.dto.ShowtimeRequest;
import com.cinebook.backend.modules.showtimes.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
public class ShowtimeController {
    private final ShowtimeService showtimeService;

    @GetMapping
    public ApiResponse<Page<ShowtimeDto>> getAllShowtimes(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Pageable pageable) {
        return ApiResponse.ok(showtimeService.getAllShowtimes(movieId, cinemaId, date, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ShowtimeDto> getShowtimeById(@PathVariable Long id) {
        return ApiResponse.ok(showtimeService.getShowtimeById(id));
    }

    @GetMapping("/{id}/seats")
    public ApiResponse<List<com.cinebook.backend.modules.showtimes.dto.SeatStatusDto>> getSeatsByShowtime(
            @PathVariable Long id) {
        return ApiResponse.ok(showtimeService.getSeatsByShowtime(id));
    }

    @PostMapping("/{id}/seats/{seatId}/hold")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<String> holdSeat(
            @PathVariable Long id,
            @PathVariable Long seatId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        showtimeService.holdSeat(id, seatId, userDetails.getUsername());
        return ApiResponse.ok("Seat held successfully");
    }

    @DeleteMapping("/{id}/seats/{seatId}/hold")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<String> releaseSeat(
            @PathVariable Long id,
            @PathVariable Long seatId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        showtimeService.releaseSeat(id, seatId, userDetails.getUsername());
        return ApiResponse.ok("Seat released successfully");
    }

    @DeleteMapping("/{id}/holds")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<String> releaseAllHolds(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        showtimeService.releaseAllHoldsForUser(id, userDetails.getUsername());
        return ApiResponse.ok("All seats released successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<ShowtimeDto> createShowtime(@RequestBody ShowtimeRequest request) {
        return ApiResponse.ok(showtimeService.createShowtime(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<ShowtimeDto> updateShowtime(@PathVariable Long id, @RequestBody ShowtimeRequest request) {
        return ApiResponse.ok(showtimeService.updateShowtime(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<String> deleteShowtime(@PathVariable Long id) {
        showtimeService.deleteShowtime(id);
        return ApiResponse.ok("Showtime deleted successfully");
    }
}
