package com.cinebook.backend.modules.bookings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingCalculationResponse {
    private Integer ticketTotal;
    private Integer fnbTotal;
    private Integer subTotal;
    private Integer discountAmount;
    private BigDecimal vatRate;
    private Integer vatAmount;
    private Integer totalAmount;
    
    // Additional fields for frontend to render promo details
    private String promoDiscountType;
    private BigDecimal promoDiscountValue;
}
