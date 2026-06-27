package com.cinebook.backend.modules.reviews.service;

import com.cinebook.backend.modules.reviews.dto.ReviewDto;
import com.cinebook.backend.modules.reviews.entity.Review;
import com.cinebook.backend.modules.reviews.entity.ReviewStatus;
import com.cinebook.backend.modules.reviews.repository.ReviewRepository;
import com.cinebook.backend.modules.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository repository;
    private final UserRepository userRepository;
    private final com.cinebook.backend.modules.bookings.repository.BookingRepository bookingRepository;
    private final com.cinebook.backend.modules.movies.repository.MovieRepository movieRepository;

    public Review createReview(Long customerId, Long movieId, Long bookingId, Integer rating, String comment) {
        com.cinebook.backend.modules.bookings.entity.Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé."));
        
        if (!booking.getCustomer().getUserId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền đánh giá vé này.");
        }

        if (booking.getShowtime().getEndTime().isAfter(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Suất chiếu chưa kết thúc, bạn chưa thể đánh giá.");
        }

        // Kiểm tra xem đã đánh giá chưa, nếu rồi thì cập nhật
        java.util.Optional<Review> existingReview = repository.findByBookingIdAndCustomerId(bookingId, customerId);
        
        Review review;
        if (existingReview.isPresent()) {
            review = existingReview.get();
            review.setRating(rating);
            review.setComment(comment);
        } else {
            review = Review.builder()
                    .customerId(customerId)
                    .movieId(movieId)
                    .bookingId(bookingId)
                    .rating(rating)
                    .comment(comment)
                    .status(ReviewStatus.Active)
                    .build();
        }
        
        Review savedReview = repository.save(review);
        updateMovieRating(movieId);
        return savedReview;
    }

    private void updateMovieRating(Long movieId) {
        List<Review> reviews = repository.findByMovieIdOrderByCreatedAtDesc(movieId).stream()
                .filter(r -> r.getStatus() == ReviewStatus.Active)
                .collect(Collectors.toList());
        
        com.cinebook.backend.modules.movies.entity.Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        if (reviews.isEmpty()) {
            movie.setAvgRating(java.math.BigDecimal.ZERO);
            movie.setReviewCount(0);
        } else {
            double sum = reviews.stream().mapToInt(Review::getRating).sum();
            double avg = sum / reviews.size();
            avg = Math.round(avg * 10.0) / 10.0;
            movie.setAvgRating(java.math.BigDecimal.valueOf(avg));
            movie.setReviewCount(reviews.size());
        }
        movieRepository.save(movie);
    }

    public List<ReviewDto> getReviewsByMovieId(Long movieId) {
        List<Review> reviews = repository.findByMovieIdOrderByCreatedAtDesc(movieId);
        return reviews.stream()
                .filter(r -> r.getStatus() == ReviewStatus.Active)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public org.springframework.data.domain.Page<ReviewDto> getAllReviewsAdmin(org.springframework.data.domain.Pageable pageable) {
        return repository.findAll(pageable).map(this::mapToDto);
    }

    public ReviewDto getReviewByBookingId(Long bookingId) {
        Review review = repository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Chưa có đánh giá cho vé này."));
        return mapToDto(review);
    }

    public ReviewDto updateReviewStatus(Long id, ReviewStatus status) {
        Review review = repository.findById(id).orElseThrow(() -> new RuntimeException("Review not found"));
        review.setStatus(status);
        Review savedReview = repository.save(review);
        updateMovieRating(savedReview.getMovieId());
        return mapToDto(savedReview);
    }

    private ReviewDto mapToDto(Review r) {
        String customerName = userRepository.findById(r.getCustomerId())
                .map(u -> u.getFullName())
                .orElse("Khách hàng");
        return ReviewDto.builder()
                .id(r.getId())
                .customerId(r.getCustomerId())
                .customerName(customerName)
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .status(r.getStatus().name())
                .build();
    }
}
