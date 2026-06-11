package com.cinebook.backend.modules.bookings.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.bookings.dto.CreateBookingRequest;
import com.cinebook.backend.modules.bookings.entity.Booking;
import com.cinebook.backend.modules.bookings.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('Customer')")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        Booking booking = bookingService.createBooking(
                request.getCustomerId(),
                request.getShowtimeId(),
                request.getSeatIds(),
                request.getFnbItems()
        );
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("id", booking.getId());
        data.put("bookingId", booking.getId());
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<org.springframework.data.domain.Page<com.cinebook.backend.modules.bookings.dto.BookingAdminDto>> getAllBookingsAdmin(org.springframework.data.domain.Pageable pageable) {
        return ApiResponse.ok(bookingService.getAllBookingsAdmin(pageable));
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<com.cinebook.backend.modules.bookings.dto.BookingAdminDto> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam com.cinebook.backend.modules.bookings.entity.BookingStatus status) {
        return ApiResponse.ok(bookingService.updateBookingStatus(id, status));
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('Customer')")
    public ApiResponse<java.util.List<com.cinebook.backend.modules.bookings.dto.MyBookingDto>> getMyBookings(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ApiResponse.ok(bookingService.getMyBookings(userDetails.getUsername()));
    }

    @GetMapping("/my-tickets")
    @PreAuthorize("hasRole('Customer')")
    public ApiResponse<java.util.List<com.cinebook.backend.modules.bookings.dto.MyBookingDto>> getMyTickets(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ApiResponse.ok(bookingService.getMyBookings(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('Customer', 'SystemAdmin', 'ScheduleManager')")
    public ApiResponse<com.cinebook.backend.modules.bookings.dto.MyBookingDto> getBookingById(
            @PathVariable Long id) {
        return ApiResponse.ok(bookingService.getBookingById(id));
    }
}
