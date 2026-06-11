package com.cinebook.backend.modules.resale.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResaleListingResponse {
    private String id;
    private String bookingId;
    private String movieTitle;
    private String moviePoster;
    private String cinemaName;
    private String showDate;
    private String showTime;
    private String seatNumber;
    private String ticketType;
    private Integer originalPrice;
    private Integer resalePrice;
    private Boolean includesFnb;
    private String sellerName;
    private String sellerPhone;
    private String note;
    private String status;
    private String hiddenReason;
    private LocalDateTime hiddenAt;
    private LocalDateTime createdAt;
}
