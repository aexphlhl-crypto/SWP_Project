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
    @PreAuthorize("hasAnyRole('Customer', 'SystemAdmin', 'ScheduleManager')")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        Booking booking = bookingService.createBooking(
                request.getCustomerId(),
                request.getShowtimeId(),
                request.getSeatIds(),
                request.getFnbItems(),
                request.getPromoCode()
        );
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("id", booking.getId());
        data.put("bookingId", booking.getId());
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @PostMapping("/calculate")
    @PreAuthorize("hasAnyRole('Customer', 'SystemAdmin', 'ScheduleManager')")
    public ResponseEntity<ApiResponse<com.cinebook.backend.modules.bookings.dto.BookingCalculationResponse>> calculateBooking(@Valid @RequestBody CreateBookingRequest request) {
        com.cinebook.backend.modules.bookings.dto.BookingCalculationResponse response = bookingService.calculateBooking(
                request.getCustomerId(),
                request.getShowtimeId(),
                request.getSeatIds(),
                request.getFnbItems(),
                request.getPromoCode()
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('Customer', 'SystemAdmin', 'ScheduleManager')")
    public ApiResponse<String> cancelMyBooking(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        bookingService.cancelMyBooking(id, userDetails.getUsername());
        return ApiResponse.ok("Booking cancelled successfully");
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<org.springframework.data.domain.Page<com.cinebook.backend.modules.bookings.dto.BookingAdminDto>> getAllBookingsAdmin(org.springframework.data.domain.Pageable pageable) {
        return ApiResponse.ok(bookingService.getAllBookingsAdmin(pageable));
    }

    @GetMapping("/admin/export")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ResponseEntity<byte[]> exportBookingsToExcel() {
        try {
            byte[] excelContent = bookingService.exportBookingsToExcel();
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bookings_report.xlsx\"")
                    .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelContent);
        } catch (java.io.IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<com.cinebook.backend.modules.bookings.dto.BookingAdminDto> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam com.cinebook.backend.modules.bookings.entity.BookingStatus status) {
        return ApiResponse.ok(bookingService.updateBookingStatus(id, status));
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasAnyRole('Customer', 'SystemAdmin', 'ScheduleManager')")
    public ApiResponse<java.util.List<com.cinebook.backend.modules.bookings.dto.MyBookingDto>> getMyBookings(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ApiResponse.ok(bookingService.getMyBookings(userDetails.getUsername()));
    }

    @GetMapping("/my-tickets")
    @PreAuthorize("hasAnyRole('Customer', 'SystemAdmin', 'ScheduleManager')")
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
