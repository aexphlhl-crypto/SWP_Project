package com.cinebook.backend.modules.rooms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id", columnDefinition = "BIGINT UNSIGNED")
    private Long seatId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "row_label", nullable = false, length = 5)
    private String rowLabel;

    @Column(name = "col_number", nullable = false)
    private Integer colNumber;

    @Column(name = "seat_label", nullable = false, length = 10)
    private String seatLabel;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false)
    @Builder.Default
    private SeatType seatType = SeatType.Normal;
}
