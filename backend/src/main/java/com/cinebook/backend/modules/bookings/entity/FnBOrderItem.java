package com.cinebook.backend.modules.bookings.entity;

import jakarta.persistence.*;
import lombok.*;
import com.cinebook.backend.modules.fnb.entity.FnBProduct;

@Entity
@Table(name = "FnBOrderItems")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FnBOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private FnBProduct product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private Integer unitPrice;
}
