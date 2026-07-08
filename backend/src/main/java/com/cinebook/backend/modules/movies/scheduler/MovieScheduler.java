package com.cinebook.backend.modules.movies.scheduler;

import com.cinebook.backend.modules.movies.entity.Movie;
import com.cinebook.backend.modules.movies.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class MovieScheduler {

    private final MovieRepository movieRepository;

    // Run every day at midnight (00:00:00). 
    // For testing purposes, we can also use fixedRate if we want it to check more often.
    @Scheduled(cron = "0 0 0 * * *") 
    // @Scheduled(fixedRate = 3600000) // Uncomment to run every hour if needed
    @Transactional
    public void updateMovieStatus() {
        LocalDate today = LocalDate.now();
        List<Movie> comingSoonMovies = movieRepository.findByStatusAndReleaseDateLessThanEqual("ComingSoon", today);
        
        if (!comingSoonMovies.isEmpty()) {
            log.info("Found {} movies to update from ComingSoon to NowShowing", comingSoonMovies.size());
            for (Movie movie : comingSoonMovies) {
                movie.setStatus("NowShowing");
            }
            movieRepository.saveAll(comingSoonMovies);
        }
    }
}
