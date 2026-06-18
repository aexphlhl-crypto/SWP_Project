package com.cinebook.backend.modules.users;

import com.cinebook.backend.common.enums.UserStatus;
import com.cinebook.backend.common.exception.AppException;
import com.cinebook.backend.modules.bookings.entity.BookingStatus;
import com.cinebook.backend.modules.bookings.repository.BookingRepository;
import com.cinebook.backend.modules.users.dto.UserAdminDto;
import com.cinebook.backend.modules.users.dto.CreateManagerDto;
import com.cinebook.backend.common.enums.UserRole;
import com.cinebook.backend.modules.cinemas.repository.CinemaRepository;
import com.cinebook.backend.modules.cinemas.entity.Cinema;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;
    private final CinemaRepository cinemaRepository;

    public Page<UserAdminDto> getUsersByRole(UserRole role, Pageable pageable) {
        Page<User> users = userRepository.findByRoleAndDeletedAtIsNull(role, pageable);
        
        return users.map(user -> {
            int totalBookings = bookingRepository.countByCustomer_UserIdAndStatus(user.getUserId(), BookingStatus.Confirmed);
            Integer totalSpent = bookingRepository.sumTotalAfterTaxByCustomerIdAndStatus(user.getUserId(), BookingStatus.Confirmed);
            
            return UserAdminDto.builder()
                    .userId(user.getUserId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .createdAt(user.getCreatedAt())
                    .status(user.getStatus())
                    .role(user.getRole())
                    .lockedUntil(user.getLockedUntil())
                    .totalBookings(totalBookings)
                    .totalSpent(totalSpent != null ? totalSpent : 0)
                    .cinemaId(user.getCinema() != null ? user.getCinema().getCinemaId() : null)
                    .cinemaName(user.getCinema() != null ? user.getCinema().getName() : null)
                    .build();
        });
    }

    public Page<UserAdminDto> getAllUsersAdmin(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        
        return users.map(user -> {
            int totalBookings = bookingRepository.countByCustomer_UserIdAndStatus(user.getUserId(), BookingStatus.Confirmed);
            Integer totalSpent = bookingRepository.sumTotalAfterTaxByCustomerIdAndStatus(user.getUserId(), BookingStatus.Confirmed);
            
            return UserAdminDto.builder()
                    .userId(user.getUserId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .createdAt(user.getCreatedAt())
                    .status(user.getStatus())
                    .role(user.getRole())
                    .totalBookings(totalBookings)
                    .totalSpent(totalSpent)
                    .cinemaId(user.getCinema() != null ? user.getCinema().getCinemaId() : null)
                    .cinemaName(user.getCinema() != null ? user.getCinema().getName() : null)
                    .build();
        });
    }

    public UserAdminDto updateUserStatus(Long id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User not found"));
        user.setStatus(status);
        userRepository.save(user);

        int totalBookings = bookingRepository.countByCustomer_UserIdAndStatus(user.getUserId(), BookingStatus.Confirmed);
        Integer totalSpent = bookingRepository.sumTotalAfterTaxByCustomerIdAndStatus(user.getUserId(), BookingStatus.Confirmed);

        return UserAdminDto.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .createdAt(user.getCreatedAt())
                .status(user.getStatus())
                .role(user.getRole())
                .lockedUntil(user.getLockedUntil())
                .totalBookings(totalBookings)
                .totalSpent(totalSpent != null ? totalSpent : 0)
                .cinemaId(user.getCinema() != null ? user.getCinema().getCinemaId() : null)
                .cinemaName(user.getCinema() != null ? user.getCinema().getName() : null)
                .build();
    }

    public UserAdminDto lockUser(Long id, Integer days) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User not found"));
        user.setStatus(UserStatus.Locked);
        if (days != null && days > 0) {
            user.setLockedUntil(LocalDateTime.now().plusDays(days));
        } else {
            user.setLockedUntil(null); // Permanent lock
        }
        userRepository.save(user);
        return updateUserStatus(id, UserStatus.Locked); // Refresh DTO
    }

    public UserAdminDto unlockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User not found"));
        user.setStatus(UserStatus.Active);
        user.setLockedUntil(null);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
        return updateUserStatus(id, UserStatus.Active); // Refresh DTO
    }

    public UserAdminDto createManager(CreateManagerDto dto) {
        if (userRepository.existsByEmailAndDeletedAtIsNull(dto.getEmail())) {
            throw AppException.badRequest("Email already exists");
        }
        
        if (dto.getCinemaId() == null) {
            throw AppException.badRequest("Cinema ID is required");
        }
        
        Cinema cinema = cinemaRepository.findById(dto.getCinemaId())
                .orElseThrow(() -> AppException.badRequest("Cinema not found"));
        
        User manager = new User();
        manager.setFullName(dto.getFullName());
        manager.setEmail(dto.getEmail());
        manager.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        manager.setPhone(dto.getPhone());
        manager.setRole(UserRole.ScheduleManager);
        manager.setStatus(UserStatus.Active);
        manager.setCinema(cinema);
        
        userRepository.save(manager);
        
        return UserAdminDto.builder()
                .userId(manager.getUserId())
                .fullName(manager.getFullName())
                .email(manager.getEmail())
                .phone(manager.getPhone())
                .createdAt(manager.getCreatedAt())
                .status(manager.getStatus())
                .role(manager.getRole())
                .totalBookings(0)
                .totalSpent(0)
                .cinemaId(manager.getCinema().getCinemaId())
                .cinemaName(manager.getCinema().getName())
                .build();
    }

    public void deleteManager(Long id) {
        User manager = userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Manager not found"));
        
        if (manager.getRole() != UserRole.ScheduleManager) {
            throw AppException.badRequest("Can only delete managers");
        }
        
        manager.setDeletedAt(LocalDateTime.now());
        manager.setStatus(UserStatus.Inactive);
        userRepository.save(manager);
    }
}
