package com.cinebook.backend.modules.resale.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "TicketExchangeListings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketExchangeListing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "listing_id")
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(name = "asking_price", nullable = false)
    private Integer askingPrice;

    @Column(length = 200)
    private String note;

    @Column(length = 20)
    private String phone;

    @Column(name = "facebook_url", length = 300)
    private String facebookUrl;

    @Column(length = 500)
    private String seats;

    @Column(name = "includes_fnb", nullable = false)
    private Boolean includesFnb = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingStatus status;

    @Column(name = "hidden_by")
    private Long hiddenBy;

    @Column(name = "hidden_at")
    private LocalDateTime hiddenAt;

    @Column(name = "hidden_reason", columnDefinition = "TEXT")
    private String hiddenReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
