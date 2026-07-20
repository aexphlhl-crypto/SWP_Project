package com.cinebook.backend.modules.bookings.dto;

import com.cinebook.backend.modules.bookings.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingAdminDto {
    private String id;
    private String movie;
    private String customer;
    private String phone;
    private String cinema;
    private String room;
    private String showtime;
    private String seats;
    private Integer amount;
    private BookingStatus status;
    private String date;
}
