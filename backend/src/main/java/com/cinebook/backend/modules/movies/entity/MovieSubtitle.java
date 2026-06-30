package com.cinebook.backend.modules.movies.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "MovieSubtitles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieSubtitle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subtitle_id", columnDefinition = "BIGINT UNSIGNED")
    private Long subtitleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Column(name = "language", nullable = false)
    private String language;
}
