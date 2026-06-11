package com.cinebook.backend.modules.notifications.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.notifications.entity.Notification;
import com.cinebook.backend.modules.notifications.service.NotificationService;
import com.cinebook.backend.modules.users.User;
import com.cinebook.backend.modules.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService service;
    private final UserRepository userRepository;

    /**
     * Lấy thông báo của user đang đăng nhập từ JWT token.
     * userId được lấy từ SecurityContext để tránh IDOR.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<Notification>> getUserNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ApiResponse.ok(service.getNotificationsForUser(user.getUserId()));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
        return ApiResponse.ok(null);
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        service.markAllAsRead(user.getUserId());
        return ApiResponse.ok(null);
    }
}
