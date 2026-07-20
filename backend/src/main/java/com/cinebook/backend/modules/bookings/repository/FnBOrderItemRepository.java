package com.cinebook.backend.modules.bookings.repository;

import com.cinebook.backend.modules.bookings.entity.FnBOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FnBOrderItemRepository extends JpaRepository<FnBOrderItem, Long> {
    List<FnBOrderItem> findByBookingId(Long bookingId);
    void deleteByBookingId(Long bookingId);
}
