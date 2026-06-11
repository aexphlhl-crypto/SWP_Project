package com.cinebook.backend.modules.bookings.service;

import com.cinebook.backend.common.exception.AppException;
import com.cinebook.backend.modules.bookings.entity.Booking;
import com.cinebook.backend.modules.bookings.repository.BookingRepository;
import com.cinebook.backend.modules.bookings.repository.BookingSeatRepository;
import com.cinebook.backend.modules.config.service.SystemConfigService;
import com.cinebook.backend.modules.rooms.entity.Room;
import com.cinebook.backend.modules.rooms.entity.Seat;
import com.cinebook.backend.modules.rooms.entity.SeatType;
import com.cinebook.backend.modules.rooms.repository.SeatRepository;
import com.cinebook.backend.modules.showtimes.entity.Showtime;
import com.cinebook.backend.modules.showtimes.repository.ShowtimeRepository;
import com.cinebook.backend.modules.users.User;
import com.cinebook.backend.modules.users.UserRepository;
import com.cinebook.backend.modules.movies.entity.Movie;
import com.cinebook.backend.modules.bookings.dto.FnBItemRequest;
import com.cinebook.backend.modules.bookings.repository.FnBOrderItemRepository;
import com.cinebook.backend.modules.fnb.repository.FnBProductRepository;
import com.cinebook.backend.modules.notifications.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private BookingSeatRepository bookingSeatRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ShowtimeRepository showtimeRepository;
    @Mock
    private SeatRepository seatRepository;
    @Mock
    private SystemConfigService systemConfigService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private FnBOrderItemRepository fnbOrderItemRepository;
    @Mock
    private FnBProductRepository fnbProductRepository;

    @InjectMocks
    private BookingService bookingService;

    @Test
    void testCreateBooking_Success() {
        Room room = new Room();
        room.setRoomId(1L);
        room.setBaseNormalPrice(80000);

        Movie movie = new Movie();
        movie.setMovieId(1L);
        movie.setTitle("Test Movie");

        Showtime showtime = new Showtime();
        showtime.setShowtimeId(1L);
        showtime.setRoom(room);
        showtime.setMovie(movie);

        User user = new User();
        user.setUserId(1L);

        Seat seat = new Seat();
        seat.setSeatId(10L);
        seat.setSeatType(SeatType.Normal);

        when(showtimeRepository.findById(1L)).thenReturn(Optional.of(showtime));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(seatRepository.findById(10L)).thenReturn(Optional.of(seat));

        when(systemConfigService.getBasePrice()).thenReturn(BigDecimal.valueOf(80000));
        when(systemConfigService.getSeatVipMultiplier()).thenReturn(BigDecimal.valueOf(1.5));
        when(systemConfigService.getSeatCoupleMultiplier()).thenReturn(BigDecimal.valueOf(2.5));
        when(systemConfigService.getVatRate()).thenReturn(BigDecimal.valueOf(0.1)); // 10%
        when(systemConfigService.getSeatHoldMinutes()).thenReturn(15);

        Booking savedBooking = new Booking();
        savedBooking.setId(99L);
        savedBooking.setCustomer(user);
        savedBooking.setShowtime(showtime);
        savedBooking.setTotalTicketsAmount(80000);
        savedBooking.setDiscountAmount(0);
        savedBooking.setTotalAfterTax(88000); // 80k + 10% VAT
        
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        Booking response = bookingService.createBooking(1L, 1L, Collections.singletonList(10L), List.of());

        assertNotNull(response);
        assertEquals(99L, response.getId());
        verify(bookingRepository, times(2)).save(any(Booking.class));
        verify(bookingSeatRepository, times(1)).saveAll(any());
    }
}
