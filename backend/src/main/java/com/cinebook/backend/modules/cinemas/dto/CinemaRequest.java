package com.cinebook.backend.modules.cinemas.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CinemaRequest {
    private String name;
    private String address;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private String operatingHours;
    private String status;
}
