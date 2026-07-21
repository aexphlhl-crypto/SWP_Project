package com.cinebook.backend.modules.rooms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomDto {
    private Long roomId;
    private Long cinemaId;
    private String cinemaName;
    private String name;
    private Integer rows;
    private Integer columns;
    private Integer capacity;
    private Integer baseNormalPrice;
    private String status;
}
