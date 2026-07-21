package com.cinebook.backend.modules.rooms.dto;

import com.cinebook.backend.modules.rooms.entity.SeatType;
import lombok.Data;

@Data
public class SeatConfigDto {
    private String rowLabel;
    private Integer colNumber;
    private String seatLabel;
    private SeatType seatType;
}
