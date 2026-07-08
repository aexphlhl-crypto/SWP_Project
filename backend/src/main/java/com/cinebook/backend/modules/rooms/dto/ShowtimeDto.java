package com.cinebook.backend.modules.showtimes.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ShowtimeDto {
    private Long showtimeId;
    private Long movieId;
    private String movieTitle;
    private Long cinemaId;
    private String cinemaName;
    private Long roomId;
    private String roomName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String status;
    private Integer totalSeats; // Room capacity
    private Integer availableSeats; // Available seats count
}

