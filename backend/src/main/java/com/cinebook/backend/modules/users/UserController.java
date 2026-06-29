package com.cinebook.backend.modules.users;

import com.cinebook.backend.common.enums.UserStatus;
import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.users.dto.UserAdminDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.cinebook.backend.modules.users.dto.CreateManagerDto;
import com.cinebook.backend.common.enums.UserRole;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<Page<UserAdminDto>> getAllUsers(
            @RequestParam(required = false) UserRole role,
            Pageable pageable) {
        if (role != null) {
            return ApiResponse.ok(userService.getUsersByRole(role, pageable));
        }
        return ApiResponse.ok(userService.getAllUsersAdmin(pageable));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<UserAdminDto> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status) {
        return ApiResponse.ok(userService.updateUserStatus(id, status));
    }

    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<UserAdminDto> lockUser(
            @PathVariable Long id,
            @RequestParam(required = false) Integer days) {
        return ApiResponse.ok(userService.lockUser(id, days));
    }

    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<UserAdminDto> unlockUser(@PathVariable Long id) {
        return ApiResponse.ok(userService.unlockUser(id));
    }

    @PostMapping("/managers")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<UserAdminDto> createManager(@RequestBody CreateManagerDto dto) {
        return ApiResponse.ok(userService.createManager(dto));
    }

    @DeleteMapping("/managers/{id}")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<Void> deleteManager(@PathVariable Long id) {
        userService.deleteManager(id);
        return ApiResponse.ok(null);
    }
}
