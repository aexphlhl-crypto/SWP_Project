package com.cinebook.backend.modules.resale.dto;

import lombok.Data;

@Data
public class ListingRequest {
    private Long bookingId;
    private Long sellerId;
    private Integer askingPrice;
    private String note;
    private String phone;
    private String facebookUrl;
}
