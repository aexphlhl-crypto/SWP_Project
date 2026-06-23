package com.cinebook.backend.modules.movies.repository;

import com.cinebook.backend.modules.movies.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByStatusAndReleaseDateLessThanEqual(String status, LocalDate date);
    
    org.springframework.data.domain.Page<Movie> findByStatus(String status, org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<Movie> findByTitleContainingIgnoreCase(String title, org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<Movie> findByStatusAndTitleContainingIgnoreCase(String status, String title, org.springframework.data.domain.Pageable pageable);
}
