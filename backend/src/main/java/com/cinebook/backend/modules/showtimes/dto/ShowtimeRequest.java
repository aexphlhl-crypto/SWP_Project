package com.cinebook.backend.modules.showtimes.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ShowtimeRequest {
    private Long movieId;
    private Long cinemaId;
    private Long roomId;
    private LocalDateTime startTime;
    private Integer priceOverride;
    private String status;
}
