package com.cinebook.backend.modules.movies.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.movies.dto.GenreDTO;
import com.cinebook.backend.modules.movies.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
public class GenreController {

    private final GenreService genreService;

    @GetMapping
    public ApiResponse<List<GenreDTO>> getAllGenres() {
        return ApiResponse.ok(genreService.getAllGenres());
    }

    @GetMapping("/{id}")
    public ApiResponse<GenreDTO> getGenreById(@PathVariable Integer id) {
        return ApiResponse.ok(genreService.getGenreById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<GenreDTO> createGenre(@RequestBody GenreDTO genreDTO) {
        return ApiResponse.ok(genreService.createGenre(genreDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<GenreDTO> updateGenre(@PathVariable Integer id, @RequestBody GenreDTO genreDTO) {
        return ApiResponse.ok(genreService.updateGenre(id, genreDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<Void> deleteGenre(@PathVariable Integer id) {
        genreService.deleteGenre(id);
        return ApiResponse.ok(null);
    }
}
