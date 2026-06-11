package com.cinebook.backend.modules.cinemas.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.cinemas.dto.CinemaRequest;
import com.cinebook.backend.modules.cinemas.entity.Cinema;
import com.cinebook.backend.modules.cinemas.service.CinemaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cinemas")
@RequiredArgsConstructor
public class CinemaController {
    private final CinemaService cinemaService;

    @GetMapping
    public ApiResponse<Page<Cinema>> getAllCinemas(Pageable pageable) {
        return ApiResponse.ok(cinemaService.getAllCinemas(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<Cinema> getCinemaById(@PathVariable Long id) {
        return ApiResponse.ok(cinemaService.getCinemaById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<Cinema> createCinema(@RequestBody CinemaRequest request) {
        return ApiResponse.ok(cinemaService.createCinema(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<Cinema> updateCinema(@PathVariable Long id, @RequestBody CinemaRequest request) {
        return ApiResponse.ok(cinemaService.updateCinema(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<String> deleteCinema(@PathVariable Long id) {
        cinemaService.deleteCinema(id);
        return ApiResponse.ok("Cinema deleted successfully");
    }
}
