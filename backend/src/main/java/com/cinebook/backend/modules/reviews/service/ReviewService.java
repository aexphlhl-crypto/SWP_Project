package com.cinebook.backend.modules.reviews.service;

import com.cinebook.backend.common.exception.AppException;
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
    private final com.cinebook.backend.security.SecurityUtil securityUtil;

    public Review createReview(Long customerId, Long movieId, Long bookingId, Integer rating, String comment) {
        Long authenticatedUserId = securityUtil.getCurrentUserId();

        com.cinebook.backend.modules.bookings.entity.Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy đơn hàng."));

        if (!booking.getCustomer().getUserId().equals(authenticatedUserId)) {
            throw AppException.forbidden("Bạn không có quyền đánh giá đơn đặt vé này.");
        }

        com.cinebook.backend.modules.bookings.entity.BookingStatus status = booking.getStatus();
        if (status != com.cinebook.backend.modules.bookings.entity.BookingStatus.Confirmed &&
            status != com.cinebook.backend.modules.bookings.entity.BookingStatus.CheckedIn) {
            throw AppException.badRequest("Chỉ những đơn hàng đã thanh toán thành công hoặc đã soát vé mới được viết đánh giá.");
        }

        if (booking.getShowtime().getEndTime().isAfter(java.time.LocalDateTime.now())) {
            throw AppException.badRequest("Suất chiếu chưa kết thúc. Bạn chỉ có thể đánh giá sau khi suất chiếu hoàn tất.");
        }

        // Check by (authenticatedUserId, movieId) — matches DB constraint
        java.util.Optional<Review> existingReview = repository.findByCustomerIdAndMovieId(authenticatedUserId, movieId);

        Review review;
        if (existingReview.isPresent()) {
            review = existingReview.get();
            if (!securityUtil.isCurrentUserAdmin() && review.getCreatedAt() != null &&
                    java.time.LocalDateTime.now().isAfter(review.getCreatedAt().plusDays(7))) {
                throw AppException.badRequest("Đã quá thời hạn 7 ngày để chỉnh sửa đánh giá.");
            }
            review.setRating(rating);
            review.setComment(comment);
            review.setBookingId(bookingId);
        } else {
            review = Review.builder()
                    .customerId(authenticatedUserId)
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

    public void deleteReview(Long id) {
        Review review = repository.findById(id).orElseThrow(() -> AppException.notFound("Không tìm thấy đánh giá."));
        Long authenticatedUserId = securityUtil.getCurrentUserId();

        if (!review.getCustomerId().equals(authenticatedUserId) && !securityUtil.isCurrentUserAdmin()) {
            throw AppException.forbidden("Bạn không có quyền xóa đánh giá này.");
        }

        if (!securityUtil.isCurrentUserAdmin() && review.getCreatedAt() != null &&
                java.time.LocalDateTime.now().isAfter(review.getCreatedAt().plusDays(7))) {
            throw AppException.badRequest("Đã quá thời hạn 7 ngày để xóa đánh giá.");
        }

        review.setStatus(ReviewStatus.Deleted);
        repository.save(review);
        updateMovieRating(review.getMovieId());
    }


    private void updateMovieRating(Long movieId) {
        List<Review> reviews = repository.findByMovieIdOrderByCreatedAtDesc(movieId).stream()
                .filter(r -> r.getStatus() == ReviewStatus.Active)
                .collect(Collectors.toList());
        
        com.cinebook.backend.modules.movies.entity.Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy phim."));
        
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
                .orElseThrow(() -> AppException.notFound("Không tìm thấy đánh giá nào cho đơn đặt vé này."));

        Long authenticatedUserId = securityUtil.getCurrentUserId();
        if (!review.getCustomerId().equals(authenticatedUserId) && !securityUtil.isCurrentUserAdmin()) {
            throw AppException.forbidden("Bạn không có quyền xem đánh giá này.");
        }

        return mapToDto(review);
    }

    public ReviewDto updateReviewStatus(Long id, ReviewStatus status) {
        Review review = repository.findById(id).orElseThrow(() -> AppException.notFound("Không tìm thấy đánh giá."));
        review.setStatus(status);
        Review savedReview = repository.save(review);
        updateMovieRating(savedReview.getMovieId());
        return mapToDto(savedReview);
    }

    private ReviewDto mapToDto(Review r) {
        String customerName = userRepository.findById(r.getCustomerId())
                .map(u -> u.getFullName())
                .orElse("Unknown");
                
        String movieTitle = movieRepository.findById(r.getMovieId())
                .map(com.cinebook.backend.modules.movies.entity.Movie::getTitle)
                .orElse("Unknown");
                
        String cinemaName = "Unknown";
        if (r.getBookingId() != null) {
            cinemaName = bookingRepository.findById(r.getBookingId())
                    .filter(b -> b.getShowtime() != null && b.getShowtime().getRoom() != null && b.getShowtime().getRoom().getCinema() != null)
                    .map(b -> b.getShowtime().getRoom().getCinema().getName())
                    .orElse("Unknown");
        }

        return ReviewDto.builder()
                .id(r.getId())
                .customerId(r.getCustomerId())
                .customerName(customerName)
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .status(r.getStatus().name())
                .movieTitle(movieTitle)
                .cinemaName(cinemaName)
                .build();
    }
}
