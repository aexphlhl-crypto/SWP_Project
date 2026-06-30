package com.cinebook.backend.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecentBookingResponse {
    private String id;
    private String movie;
    private String customer;
    private String seats;
    private String amount;
    private String status;
}
