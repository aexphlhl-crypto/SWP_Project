package com.cinebook.backend.modules.rooms.dto;

import lombok.Data;

@Data
public class RoomRequest {
    private Long cinemaId;
    private String name;
    private Integer rows;
    private Integer columns;
    private Integer baseNormalPrice;
    private String roomType;
    private String status;
}
