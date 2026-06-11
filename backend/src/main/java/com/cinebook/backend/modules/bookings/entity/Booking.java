package com.cinebook.backend.modules.bookings.entity;

import com.cinebook.backend.modules.showtimes.entity.Showtime;
import com.cinebook.backend.modules.users.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Bookings")
@Data
@NoArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "showtime_id", nullable = false)
    private Showtime showtime;

    @Column(name = "total_tickets_amount", nullable = false)
    private Integer totalTicketsAmount = 0;

    @Column(name = "total_fnb_amount", nullable = false)
    private Integer totalFnbAmount = 0;

    @Column(name = "sub_total", nullable = false)
    private Integer subTotal = 0;

    @Column(name = "discount_amount", nullable = false)
    private Integer discountAmount = 0;

    @Column(name = "total_before_tax", nullable = false)
    private Integer totalBeforeTax = 0;

    @Column(name = "vat_rate_snapshot", nullable = false, precision = 5, scale = 4)
    private BigDecimal vatRateSnapshot;

    @Column(name = "vat_amount", nullable = false)
    private Integer vatAmount = 0;

    @Column(name = "total_after_tax", nullable = false)
    private Integer totalAfterTax = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookingStatus status = BookingStatus.Pending;

    @Column(name = "hold_expires_at")
    private LocalDateTime holdExpiresAt;

    @Column(name = "qr_code", length = 500)
    private String qrCode;

    @Column(name = "promo_id")
    private Long promoId;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
