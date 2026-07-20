package com.cinebook.backend.modules.movies.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.Set;

@Data
public class MovieRequest {
    private String title;
    private String synopsis;
    private Integer durationMin;
    private LocalDate releaseDate;
    private String ageRating;
    private String language;
    private String director;
    private String castList;
    private String posterUrl;
    private String trailerUrl;
    private Set<Integer> genreIds;
    private Set<Long> actorIds;
    private String status;
}
