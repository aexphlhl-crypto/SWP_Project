package com.cinebook.backend.modules.reviews.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long customerId;
    private Long movieId;
    private Long bookingId;
    private Integer rating;
    private String comment;
}
