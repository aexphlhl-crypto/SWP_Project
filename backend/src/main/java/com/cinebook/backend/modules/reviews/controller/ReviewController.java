package com.cinebook.backend.modules.reviews.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.reviews.dto.ReviewDto;
import com.cinebook.backend.modules.reviews.dto.ReviewRequest;
import com.cinebook.backend.modules.reviews.entity.Review;
import com.cinebook.backend.modules.reviews.entity.ReviewStatus;
import com.cinebook.backend.modules.reviews.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService service;

    @PostMapping
    @PreAuthorize("hasRole('Customer')")
    public ApiResponse<Review> create(@RequestBody ReviewRequest request) {
        Review review = service.createReview(
                request.getCustomerId(),
                request.getMovieId(),
                request.getBookingId(),
                request.getRating(),
                request.getComment()
        );
        return ApiResponse.ok(review);
    }

    @GetMapping("/movie/{movieId}")
    public ApiResponse<List<ReviewDto>> getMovieReviews(@PathVariable Long movieId) {
        return ApiResponse.ok(service.getReviewsByMovieId(movieId));
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('Customer')")
    public ApiResponse<ReviewDto> getReviewByBooking(@PathVariable Long bookingId) {
        return ApiResponse.ok(service.getReviewByBookingId(bookingId));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<Page<ReviewDto>> getAllReviewsAdmin(Pageable pageable) {
        return ApiResponse.ok(service.getAllReviewsAdmin(pageable));
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<ReviewDto> updateReviewStatus(
            @PathVariable Long id,
            @RequestParam ReviewStatus status) {
        return ApiResponse.ok(service.updateReviewStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Customer', 'SystemAdmin')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.deleteReview(id);
        return ApiResponse.ok(null);
    }
}
