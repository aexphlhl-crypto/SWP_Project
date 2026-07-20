package com.cinebook.backend.modules.resale.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResaleListingRequest {
    private Long bookingId;
    private Long sellerId;
    private Integer askingPrice;
    private String note;
    private String phone;
    private String facebookUrl;
    private String seats;
    private Boolean includesFnb;
}
