package com.cinebook.backend.modules.cinemas.repository;

import com.cinebook.backend.modules.cinemas.entity.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Long> {
}
