package com.cinebook.backend.modules.movies.service;

import com.cinebook.backend.modules.movies.dto.MovieRequest;
import com.cinebook.backend.modules.movies.entity.Movie;
import com.cinebook.backend.modules.movies.entity.Genre;
import com.cinebook.backend.modules.movies.repository.MovieRepository;
import com.cinebook.backend.modules.movies.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MovieService {
    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;

    public Page<Movie> getAllMovies(String status, String search, Pageable pageable) {
        if (status != null && !status.isEmpty() && search != null && !search.isEmpty()) {
            return movieRepository.findByStatusAndTitleContainingIgnoreCase(status, search, pageable);
        } else if (status != null && !status.isEmpty()) {
            return movieRepository.findByStatus(status, pageable);
        } else if (search != null && !search.isEmpty()) {
            return movieRepository.findByTitleContainingIgnoreCase(search, pageable);
        }
        return movieRepository.findAll(pageable);
    }

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id).orElseThrow(() -> new RuntimeException("Movie not found"));
    }

    @Transactional
    public Movie createMovie(MovieRequest request) {
        Movie movie = Movie.builder()
                .title(request.getTitle())
                .synopsis(request.getSynopsis())
                .durationMin(request.getDurationMin())
                .releaseDate(request.getReleaseDate())
                .ageRating(request.getAgeRating())
                .language(request.getLanguage())
                .director(request.getDirector())
                .castList(request.getCastList())
                .posterUrl(request.getPosterUrl())
                .trailerUrl(request.getTrailerUrl())
                .status(request.getStatus() != null ? request.getStatus() : "Hidden")
                .avgRating(java.math.BigDecimal.ZERO)
                .reviewCount(0)
                .build();
                
        if (request.getGenreIds() != null && !request.getGenreIds().isEmpty()) {
            List<Genre> genres = genreRepository.findAllById(request.getGenreIds());
            movie.setGenres(new HashSet<>(genres));
        }
        
        return movieRepository.save(movie);
    }

    @Transactional
    public Movie updateMovie(Long id, MovieRequest request) {
        Movie movie = getMovieById(id);
        movie.setTitle(request.getTitle());
        movie.setSynopsis(request.getSynopsis());
        movie.setDurationMin(request.getDurationMin());
        movie.setReleaseDate(request.getReleaseDate());
        movie.setAgeRating(request.getAgeRating());
        movie.setLanguage(request.getLanguage());
        movie.setDirector(request.getDirector());
        movie.setCastList(request.getCastList());
        movie.setPosterUrl(request.getPosterUrl());
        movie.setTrailerUrl(request.getTrailerUrl());
        if (request.getStatus() != null) {
            movie.setStatus(request.getStatus());
        }
        
        if (request.getGenreIds() != null) {
            List<Genre> genres = genreRepository.findAllById(request.getGenreIds());
            movie.setGenres(new HashSet<>(genres));
        } else {
            movie.setGenres(new HashSet<>());
        }
        
        return movieRepository.save(movie);
    }

    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = getMovieById(id);
        movie.setDeletedAt(java.time.LocalDateTime.now());
        movie.setStatus("Hidden");
        movieRepository.save(movie);
    }
}
