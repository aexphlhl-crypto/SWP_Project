package com.cinebook.backend.modules.bookings.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketDto {
    private String seatLabel;
    private String seatType;
    private Integer price;
    private String ticketCode;
    private String qrCodeValue;
}
