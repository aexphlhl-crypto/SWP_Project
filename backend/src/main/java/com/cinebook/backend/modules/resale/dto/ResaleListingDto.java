package com.cinebook.backend.modules.resale.dto;

import com.cinebook.backend.modules.resale.entity.ListingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ResaleListingDto {
    private Long id;
    private Long bookingId;
    private Long sellerId;
    private String sellerName;
    private String movieTitle;
    private String cinemaName;
    private String roomName;
    private String showDate;
    private String showTime;
    private String seats;
    private Integer originalPrice;
    private Integer askingPrice;
    private String note;
    private String phone;
    private String facebookUrl;
    private ListingStatus status;
    private LocalDateTime createdAt;
}
