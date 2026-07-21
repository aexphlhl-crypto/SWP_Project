package com.cinebook.backend.modules.cinemas.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "Cinemas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cinema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cinema_id", columnDefinition = "BIGINT UNSIGNED")
    private Long cinemaId;

    @Column(name = "name", nullable = false, length = 150, unique = true)
    private String name;

    @Column(name = "address", nullable = false, length = 300)
    private String address;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 10, scale = 6)
    private BigDecimal longitude;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "operating_hours", length = 200)
    private String operatingHours;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "Active";

    @org.hibernate.annotations.Formula("(SELECT COUNT(*) FROM Rooms r WHERE r.cinema_id = cinema_id)")
    private Integer totalRooms;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
