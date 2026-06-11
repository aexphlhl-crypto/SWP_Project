package com.cinebook.backend.modules.bookings.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreateBookingRequest {
    @NotNull(message = "customerId is required")
    private Long customerId;
    
    @NotNull(message = "showtimeId is required")
    private Long showtimeId;
    
    @NotEmpty(message = "seatIds must not be empty")
    private List<Long> seatIds;

    @jakarta.validation.Valid
    private List<FnBItemRequest> fnbItems;
}
