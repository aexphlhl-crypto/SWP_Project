package com.cinebook.backend.modules.reviews.repository;

import com.cinebook.backend.modules.reviews.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT m.movieId, m.title, AVG(r.rating) " +
           "FROM Review r " +
           "JOIN com.cinebook.backend.modules.movies.entity.Movie m ON r.movieId = m.movieId " +
           "WHERE r.status = :status " +
           "GROUP BY m.movieId, m.title " +
           "ORDER BY AVG(r.rating) DESC")
    java.util.List<Object[]> findTopMoviesByRating(@Param("status") com.cinebook.backend.modules.reviews.entity.ReviewStatus status, org.springframework.data.domain.Pageable pageable);

    java.util.List<Review> findByMovieIdOrderByCreatedAtDesc(Long movieId);
    
    java.util.Optional<Review> findByBookingIdAndCustomerId(Long bookingId, Long customerId);
    
    java.util.Optional<Review> findByCustomerIdAndMovieIdAndBookingId(Long customerId, Long movieId, Long bookingId);
    
    java.util.Optional<Review> findByBookingId(Long bookingId);
}
