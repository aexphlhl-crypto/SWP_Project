package com.cinebook.backend.modules.showtimes.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SeatStatusDto {
    private Long seatId;
    private String rowLabel;
    private Integer colNumber;
    private String seatLabel;
    private String seatType;
    private String status; // "Available" or "Booked"
    private Integer price;
}
