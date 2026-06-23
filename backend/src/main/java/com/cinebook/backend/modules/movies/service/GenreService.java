package com.cinebook.backend.modules.movies.service;

import com.cinebook.backend.modules.movies.dto.GenreDTO;
import com.cinebook.backend.modules.movies.entity.Genre;
import com.cinebook.backend.modules.movies.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenreService {
    private final GenreRepository genreRepository;

    public List<GenreDTO> getAllGenres() {
        return genreRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public GenreDTO getGenreById(Integer id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Genre not found"));
        return mapToDTO(genre);
    }

    public GenreDTO createGenre(GenreDTO genreDTO) {
        if (genreRepository.existsByName(genreDTO.getName())) {
            throw new RuntimeException("Genre name already exists");
        }
        Genre genre = Genre.builder()
                .name(genreDTO.getName())
                .build();
        Genre savedGenre = genreRepository.save(genre);
        return mapToDTO(savedGenre);
    }

    public GenreDTO updateGenre(Integer id, GenreDTO genreDTO) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Genre not found"));
        
        // Only check name existence if it changed
        if (!genre.getName().equalsIgnoreCase(genreDTO.getName()) && genreRepository.existsByName(genreDTO.getName())) {
            throw new RuntimeException("Genre name already exists");
        }
        
        genre.setName(genreDTO.getName());
        Genre updatedGenre = genreRepository.save(genre);
        return mapToDTO(updatedGenre);
    }

    public void deleteGenre(Integer id) {
        if (!genreRepository.existsById(id)) {
            throw new RuntimeException("Genre not found");
        }
        genreRepository.deleteById(id);
    }

    private GenreDTO mapToDTO(Genre genre) {
        return GenreDTO.builder()
                .genreId(genre.getGenreId())
                .name(genre.getName())
                .build();
    }
}
