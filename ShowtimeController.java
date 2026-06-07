package com.cinebook.backend.modules.showtimes.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.showtimes.dto.ShowtimeDto;
import com.cinebook.backend.modules.showtimes.dto.ShowtimeRequest;
import com.cinebook.backend.modules.showtimes.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
public class ShowtimeController {
    private final ShowtimeService showtimeService;

    @GetMapping
    public ApiResponse<Page<ShowtimeDto>> getAllShowtimes(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date,
            Pageable pageable) {
        return ApiResponse.ok(showtimeService.getAllShowtimes(movieId, cinemaId, date, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ShowtimeDto> getShowtimeById(@PathVariable Long id) {
        return ApiResponse.ok(showtimeService.getShowtimeById(id));
    }

    @GetMapping("/{id}/seats")
    public ApiResponse<java.util.List<com.cinebook.backend.modules.showtimes.dto.SeatStatusDto>> getSeatsByShowtime(@PathVariable Long id) {
        return ApiResponse.ok(showtimeService.getSeatsByShowtime(id));
    }

    @PostMapping
    public ApiResponse<ShowtimeDto> createShowtime(@RequestBody ShowtimeRequest request) {
        return ApiResponse.ok(showtimeService.createShowtime(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ShowtimeDto> updateShowtime(@PathVariable Long id, @RequestBody ShowtimeRequest request) {
        return ApiResponse.ok(showtimeService.updateShowtime(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteShowtime(@PathVariable Long id) {
        showtimeService.deleteShowtime(id);
        return ApiResponse.ok("Showtime deleted successfully");
    }
}
