package com.cinebook.backend.modules.movies.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Genres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Genre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "genre_id", columnDefinition = "TINYINT UNSIGNED")
    private Integer genreId;

    @Column(name = "name", nullable = false, length = 50, unique = true)
    private String name;
}
