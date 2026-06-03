package com.cinebook.backend.modules.rooms.entity;

import jakarta.persistence.*;
import lombok.*;
import com.cinebook.backend.modules.cinemas.entity.Cinema;
import java.time.LocalDateTime;

@Entity
@Table(name = "Rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id", columnDefinition = "BIGINT UNSIGNED")
    private Long roomId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "rows_count", nullable = false) // Note: DB column is "rows", but "rows" might be reserved in some contexts. Let's use column definition.
    private Integer rows;

    @Column(name = "columns_count", nullable = false) // Same as rows
    private Integer columns;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "base_normal_price", nullable = false)
    private Integer baseNormalPrice;

    @Column(name = "seat_layout", columnDefinition = "JSON")
    private String seatLayout;

    @Column(name = "room_type", nullable = false)
    @Builder.Default
    private String roomType = "2D";

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "Active";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
