package com.cinebook.backend.modules.cinemas.service;

import com.cinebook.backend.modules.cinemas.dto.CinemaRequest;
import com.cinebook.backend.modules.cinemas.entity.Cinema;
import com.cinebook.backend.modules.cinemas.repository.CinemaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CinemaService {
    private final CinemaRepository cinemaRepository;
    private final com.cinebook.backend.modules.users.UserRepository userRepository;
    private final com.cinebook.backend.modules.bookings.repository.BookingRepository bookingRepository;
    private final com.cinebook.backend.modules.showtimes.repository.ShowtimeRepository showtimeRepository;

    public Page<Cinema> getAllCinemas(Pageable pageable) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            boolean isScheduleManager = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ScheduleManager"));
            if (isScheduleManager) {
                String email = auth.getName();
                com.cinebook.backend.modules.users.User user = userRepository.findByEmailAndDeletedAtIsNull(email).orElse(null);
                if (user != null && user.getCinema() != null && "Active".equalsIgnoreCase(user.getCinema().getStatus())) {
                    return cinemaRepository.findByCinemaIdAndStatus(user.getCinema().getCinemaId(), "Active", pageable);
                } else {
                    return Page.empty(pageable);
                }
            }
        }
        return cinemaRepository.findByStatus("Active", pageable);
    }

    public Cinema getCinemaById(Long id) {
        return cinemaRepository.findById(id).orElseThrow(() -> new RuntimeException("Cinema not found"));
    }

    @Transactional
    public Cinema createCinema(CinemaRequest request) {
        Cinema cinema = Cinema.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .phone(request.getPhone())
                .operatingHours(request.getOperatingHours())
                .build();
        return cinemaRepository.save(cinema);
    }

    @Transactional
    public Cinema updateCinema(Long id, CinemaRequest request) {
        Cinema cinema = getCinemaById(id);
        cinema.setName(request.getName());
        cinema.setAddress(request.getAddress());
        cinema.setCity(request.getCity());
        cinema.setLatitude(request.getLatitude());
        cinema.setLongitude(request.getLongitude());
        cinema.setPhone(request.getPhone());
        cinema.setOperatingHours(request.getOperatingHours());
        if (request.getStatus() != null) {
            cinema.setStatus(request.getStatus());
        }
        return cinemaRepository.save(cinema);
    }

    @Transactional
    public void deleteCinema(Long id) {
        Cinema cinema = getCinemaById(id);
        boolean hasBookings = bookingRepository.existsByShowtimeCinemaCinemaId(id);
        if (hasBookings) {
            throw com.cinebook.backend.common.exception.AppException.badRequest("Không thể xóa rạp này vì đã có vé được đặt tại các phòng chiếu của rạp.");
        }
        showtimeRepository.deleteByCinemaId(id);
        cinemaRepository.delete(cinema);
    }
}
