package com.cinebook.backend.modules.users.dto;

import com.cinebook.backend.common.enums.UserRole;
import com.cinebook.backend.common.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminDto {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private Integer totalBookings;
    private Integer totalSpent;
    private LocalDateTime createdAt;
    private UserStatus status;
    private UserRole role;
    private LocalDateTime lockedUntil;
    private Long cinemaId;
    private String cinemaName;
}
