package com.cinebook.backend.modules.movies.repository;

import com.cinebook.backend.modules.movies.entity.MovieSubtitle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieSubtitleRepository extends JpaRepository<MovieSubtitle, Long> {
}
