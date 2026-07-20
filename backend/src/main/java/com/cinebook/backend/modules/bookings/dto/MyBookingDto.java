package com.cinebook.backend.modules.bookings.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MyBookingDto {
    private String id;
    private Long movieId;
    private String movieTitle;
    private String cinemaName;
    private String roomName;
    private String showDate;
    private String showTime;
    private String seatNumber;
    private Integer totalAmount;
    private String status;
    private Boolean checkedIn;
    private java.util.List<FnBItemDto> fnbItems;
    private java.util.List<TicketDto> tickets;
}
