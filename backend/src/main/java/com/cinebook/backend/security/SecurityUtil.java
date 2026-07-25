package com.cinebook.backend.security;

import com.cinebook.backend.common.exception.AppException;
import com.cinebook.backend.modules.users.User;
import com.cinebook.backend.modules.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtil {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw AppException.unauthorized("Người dùng chưa đăng nhập.");
        }
        String email = auth.getName();
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> AppException.unauthorized("Không tìm thấy thông tin người dùng."));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getUserId();
    }

    public boolean isCurrentUserAdmin() {
        try {
            User user = getCurrentUser();
            return user.getRole() != null && 
                   ("SystemAdmin".equalsIgnoreCase(user.getRole().name()) || 
                    "ADMIN".equalsIgnoreCase(user.getRole().name()) || 
                    "ScheduleManager".equalsIgnoreCase(user.getRole().name()));
        } catch (Exception e) {
            return false;
        }
    }
}
