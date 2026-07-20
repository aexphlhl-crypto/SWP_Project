package com.cinebook.backend.modules.showtimes.service;

import com.cinebook.backend.common.exception.AppException;
import com.cinebook.backend.modules.movies.entity.Movie;
import com.cinebook.backend.modules.movies.repository.MovieRepository;
import com.cinebook.backend.modules.rooms.entity.Room;
import com.cinebook.backend.modules.rooms.repository.RoomRepository;
import com.cinebook.backend.modules.showtimes.dto.ShowtimeRequest;
import com.cinebook.backend.modules.showtimes.dto.ShowtimeDto;
import com.cinebook.backend.modules.showtimes.entity.Showtime;
import com.cinebook.backend.modules.showtimes.repository.ShowtimeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.cinebook.backend.modules.cinemas.repository.CinemaRepository;
import com.cinebook.backend.modules.rooms.repository.SeatRepository;
import com.cinebook.backend.modules.bookings.repository.BookingSeatRepository;
import com.cinebook.backend.modules.showtimes.repository.SeatHoldRepository;
import com.cinebook.backend.modules.users.UserRepository;
import com.cinebook.backend.modules.config.service.SystemConfigService;

@ExtendWith(MockitoExtension.class)
class ShowtimeServiceTest {

    @Mock
    private ShowtimeRepository showtimeRepository;

    @Mock
    private MovieRepository movieRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private CinemaRepository cinemaRepository;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private BookingSeatRepository bookingSeatRepository;

    @Mock
    private SeatHoldRepository seatHoldRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SystemConfigService systemConfigService;

    @InjectMocks
    private ShowtimeService showtimeService;

    @Test
    void testCreateShowtime_Success() {
        ShowtimeRequest request = new ShowtimeRequest();
        request.setMovieId(1L);
        request.setCinemaId(1L);
        request.setRoomId(1L);
        request.setStartTime(LocalDateTime.now().plusDays(1));

        Movie movie = new Movie();
        movie.setMovieId(1L);
        movie.setDurationMin(120);

        com.cinebook.backend.modules.cinemas.entity.Cinema cinema = new com.cinebook.backend.modules.cinemas.entity.Cinema();
        cinema.setCinemaId(1L);

        Room room = new Room();
        room.setRoomId(1L);
        room.setCapacity(100);

        when(movieRepository.findById(1L)).thenReturn(Optional.of(movie));
        when(cinemaRepository.findById(1L)).thenReturn(Optional.of(cinema));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        // No overlapping showtimes
        when(showtimeRepository.existsConflictingShowtime(anyLong(), any(), any())).thenReturn(false);
        
        when(bookingSeatRepository.findBookedSeatsByShowtime(anyLong())).thenReturn(java.util.Collections.emptyList());

        Showtime savedShowtime = Showtime.builder().showtimeId(100L).movie(movie).cinema(cinema).room(room).startTime(request.getStartTime()).endTime(request.getStartTime().plusMinutes(120)).build();
        when(showtimeRepository.save(any(Showtime.class))).thenReturn(savedShowtime);

        ShowtimeDto response = showtimeService.createShowtime(request);

        assertNotNull(response);
        assertEquals(100L, response.getShowtimeId());
        verify(showtimeRepository, times(1)).save(any(Showtime.class));
    }

    @Test
    void testCreateShowtime_OverlapConflict() {
        ShowtimeRequest request = new ShowtimeRequest();
        request.setMovieId(1L);
        request.setCinemaId(1L);
        request.setRoomId(1L);
        request.setStartTime(LocalDateTime.now().plusDays(1));

        Movie movie = new Movie();
        movie.setMovieId(1L);
        movie.setDurationMin(120);

        com.cinebook.backend.modules.cinemas.entity.Cinema cinema = new com.cinebook.backend.modules.cinemas.entity.Cinema();
        cinema.setCinemaId(1L);

        Room room = new Room();
        room.setRoomId(1L);

        when(movieRepository.findById(1L)).thenReturn(Optional.of(movie));
        when(cinemaRepository.findById(1L)).thenReturn(Optional.of(cinema));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        
        when(showtimeRepository.existsConflictingShowtime(anyLong(), any(), any())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> showtimeService.createShowtime(request));
        assertEquals("Lịch chiếu này bị trùng thời gian với một lịch chiếu khác trong cùng phòng.", exception.getMessage());
        verify(showtimeRepository, never()).save(any(Showtime.class));
    }
}
