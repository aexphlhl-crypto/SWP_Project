package com.cinebook.backend.modules.auth;

import com.cinebook.backend.common.exception.AppException;
import com.cinebook.backend.modules.auth.dto.*;
import com.cinebook.backend.modules.auth.entity.OtpToken;
import com.cinebook.backend.modules.auth.repository.OtpTokenRepository;
import com.cinebook.backend.modules.auth.repository.RefreshTokenRepository;
import com.cinebook.backend.modules.auth.repository.PendingUserRepository;
import com.cinebook.backend.modules.users.User;
import com.cinebook.backend.modules.users.UserRepository;
import com.cinebook.backend.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpTokenRepository otpTokenRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PendingUserRepository pendingUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @Test
    void testRegister_EmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("johndoe@example.com");

        when(userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> authService.register(request));
        assertEquals("Email is already registered. Please login or reset your password.", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
    
    @Test
    void testLogin_UserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("johndoe@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> authService.login(request));
        assertEquals("Incorrect email or password. Please check again.", exception.getMessage());
    }

    @Test
    void testForgotPassword_UserNotFound() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("notfound@example.com");

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> authService.forgotPassword(request));
        assertEquals("Email không tồn tại trong hệ thống.", exception.getMessage());
    }

    @Test
    void testForgotPassword_Success() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("found@example.com");
        User user = new User();
        user.setEmail("found@example.com");

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(any(CharSequence.class))).thenReturn("hashed_otp");

        authService.forgotPassword(request);

        verify(otpTokenRepository, times(1)).save(any(OtpToken.class));
        verify(emailService, times(1)).sendResetPasswordOtp(eq("found@example.com"), anyString());
    }

    @Test
    void testVerifyForgotPasswordOtp_Success() {
        VerifyForgotOtpRequest request = new VerifyForgotOtpRequest();
        request.setEmail("user@example.com");
        request.setOtpCode("123456");

        User user = new User();
        user.setEmail("user@example.com");

        OtpToken otpToken = OtpToken.builder()
                .tokenValue("hashed_otp")
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .retryCount(0)
                .build();

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(user));
        when(otpTokenRepository.findTopByUserAndTokenTypeAndIsUsedFalseOrderByCreatedAtDesc(user, OtpToken.OtpType.PasswordReset))
                .thenReturn(Optional.of(otpToken));
        when(passwordEncoder.matches("123456", "hashed_otp")).thenReturn(true);
        when(jwtUtil.generateResetPasswordToken("user@example.com")).thenReturn("reset_token_jwt");

        String result = authService.verifyForgotPasswordOtp(request);

        assertEquals("reset_token_jwt", result);
        verify(otpTokenRepository, times(1)).delete(otpToken);
    }
}
