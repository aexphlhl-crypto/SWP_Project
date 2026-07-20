package com.cinebook.backend.modules.bookings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO dùng để trả về thông tin F&B trong response booking (MyTickets, BookingDetail...).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FnBItemDto {
    private Long productId;
    private String productName;
    private String category;
    private Integer quantity;
    private Integer unitPrice;
    private Integer subtotal;
}
