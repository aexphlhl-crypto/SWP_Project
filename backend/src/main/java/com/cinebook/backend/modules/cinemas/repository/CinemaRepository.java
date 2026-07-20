package com.cinebook.backend.modules.cinemas.repository;

import com.cinebook.backend.modules.cinemas.entity.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Long> {
    org.springframework.data.domain.Page<Cinema> findByCinemaId(Long cinemaId, org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<Cinema> findByStatus(String status, org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<Cinema> findByCinemaIdAndStatus(Long cinemaId, String status, org.springframework.data.domain.Pageable pageable);
}
