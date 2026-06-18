package com.cinebook.backend.modules.auth;

import com.cinebook.backend.common.enums.UserRole;
import com.cinebook.backend.common.enums.UserStatus;
import com.cinebook.backend.common.exception.AppException;
import com.cinebook.backend.modules.auth.dto.*;
import com.cinebook.backend.modules.auth.entity.OtpToken;
import com.cinebook.backend.modules.auth.entity.OtpToken.OtpType;
import com.cinebook.backend.modules.auth.entity.RefreshToken;
import com.cinebook.backend.modules.auth.entity.PendingUser;
import com.cinebook.backend.modules.auth.repository.OtpTokenRepository;
import com.cinebook.backend.modules.auth.repository.RefreshTokenRepository;
import com.cinebook.backend.modules.auth.repository.PendingUserRepository;
import com.cinebook.backend.modules.users.User;
import com.cinebook.backend.modules.users.UserRepository;
import com.cinebook.backend.security.JwtUtil;
import io.jsonwebtoken.Claims;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 30;
    private static final int OTP_VALIDITY_MINUTES = 10;
    private static final int MAX_OTP_RETRIES = 3;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PendingUserRepository pendingUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
            throw AppException.conflict("Email is already registered. Please login or reset your password.");
        }

        String otp = generateOtp();
        String hashedOtp = passwordEncoder.encode(otp);

        PendingUser pendingUser = pendingUserRepository.findByEmail(request.getEmail())
                .orElse(new PendingUser());

        pendingUser.setFullName(request.getFullName());
        pendingUser.setEmail(request.getEmail());
        pendingUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        pendingUser.setPhone(request.getPhone());
        pendingUser.setDateOfBirth(request.getDateOfBirth());
        pendingUser.setOtpCode(hashedOtp);
        pendingUser.setOtpExpiresAt(LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES));
        pendingUser.setOtpRetryCount(0);

        pendingUserRepository.save(pendingUser);

        emailService.sendVerificationOtp(pendingUser.getEmail(), otp);
        log.info("[DEV MODE] OTP for {} : {}", request.getEmail(), otp);

        return "Registration successful. Please check your email (or console in dev mode) for OTP verification.";
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        PendingUser pendingUser = pendingUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> AppException.badRequest("No pending registration found for this email."));

        if (pendingUser.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw AppException.badRequest("OTP has expired. Please register again.");
        }
        if (pendingUser.getOtpRetryCount() >= MAX_OTP_RETRIES) {
            throw AppException.badRequest("Too many OTP attempts. Please register again.");
        }

        if (!passwordEncoder.matches(request.getOtp(), pendingUser.getOtpCode())) {
            pendingUser.setOtpRetryCount(pendingUser.getOtpRetryCount() + 1);
            pendingUserRepository.save(pendingUser);
            throw AppException.badRequest("Incorrect OTP. " + (MAX_OTP_RETRIES - pendingUser.getOtpRetryCount()) + " attempts remaining.");
        }

        // OTP Valid -> Move to User
        User user = User.builder()
                .fullName(pendingUser.getFullName())
                .email(pendingUser.getEmail())
                .passwordHash(pendingUser.getPasswordHash())
                .phone(pendingUser.getPhone())
                .dateOfBirth(pendingUser.getDateOfBirth())
                .role(UserRole.Customer)
                .status(UserStatus.Active)
                .failedLoginAttempts(0)
                .build();

        userRepository.save(user);
        pendingUserRepository.delete(pendingUser);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> AppException.unauthorized("Incorrect email or password. Please check again."));

        // Check account lock
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw AppException.unauthorized("Account is temporarily locked due to multiple failed attempts. Please try again later.");
        }

        // Check account status
        if (user.getStatus() == UserStatus.Inactive) {
            throw AppException.unauthorized("Email not verified. Please verify your email first.");
        }
        if (user.getStatus() == UserStatus.Locked) {
            throw AppException.unauthorized("Account is locked. Please contact support.");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
                userRepository.save(user);
                throw AppException.unauthorized("Account locked for 30 minutes due to 5 failed login attempts.");
            }
            userRepository.save(user);
            throw AppException.unauthorized("Incorrect email or password. Please check again.");
        }

        // Reset failed attempts on success
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(String rawRefreshToken) {
        String tokenHash = hashToken(rawRefreshToken);
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHashAndIsRevokedFalse(tokenHash)
                .orElseThrow(() -> AppException.unauthorized("Invalid or expired refresh token."));

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw AppException.unauthorized("Refresh token expired. Please login again.");
        }

        // Rotate: revoke old, issue new
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null) return;
        String tokenHash = hashToken(rawRefreshToken);
        refreshTokenRepository.findByTokenHashAndIsRevokedFalse(tokenHash).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> AppException.notFound("Email không tồn tại trong hệ thống."));
        
        String otp = generateOtp();
        saveOtp(user, otp, OtpType.PasswordReset, 5);
        
        emailService.sendResetPasswordOtp(user.getEmail(), otp);
        log.info("[DEV MODE] Reset password OTP for {} : {}", request.getEmail(), otp);
    }

    @Transactional
    public String verifyForgotPasswordOtp(VerifyForgotOtpRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> AppException.notFound("Email không tồn tại trong hệ thống."));

        OtpToken otpToken = otpTokenRepository.findTopByUserAndTokenTypeAndIsUsedFalseOrderByCreatedAtDesc(user, OtpType.PasswordReset)
                .orElseThrow(() -> AppException.badRequest("Mã xác nhận không tồn tại hoặc đã được sử dụng."));

        if (otpToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw AppException.badRequest("Mã xác nhận đã hết hạn.");
        }

        if (otpToken.getRetryCount() >= MAX_OTP_RETRIES) {
            throw AppException.badRequest("Vượt quá số lần thử mã xác nhận tối đa.");
        }

        if (!passwordEncoder.matches(request.getOtpCode(), otpToken.getTokenValue())) {
            otpToken.setRetryCount(otpToken.getRetryCount() + 1);
            otpTokenRepository.save(otpToken);
            throw AppException.badRequest("Mã xác nhận không chính xác. Còn lại " + (MAX_OTP_RETRIES - otpToken.getRetryCount()) + " lần thử.");
        }

        // MANDATORY SECURITY ACTION: Immediately delete/invalidate the OTP from the database
        otpTokenRepository.delete(otpToken);
        otpTokenRepository.flush();

        return jwtUtil.generateResetPasswordToken(user.getEmail());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        Claims claims;
        try {
            claims = jwtUtil.parseToken(request.getToken());
        } catch (Exception e) {
            throw AppException.badRequest("Mã khôi phục không hợp lệ hoặc đã hết hạn.");
        }

        String email = claims.getSubject();
        String purpose = claims.get("purpose", String.class);

        if (email == null || !email.equalsIgnoreCase(request.getEmail()) || !"RESET_PASSWORD".equals(purpose)) {
            throw AppException.badRequest("Mã khôi phục không hợp lệ.");
        }

        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> AppException.notFound("Email không tồn tại trong hệ thống."));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Revoke all refresh tokens for security
        refreshTokenRepository.revokeAllByUser(user);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy người dùng."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw AppException.badRequest("Mật khẩu hiện tại không chính xác.");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw AppException.badRequest("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        // Revoke all refresh tokens for security
        refreshTokenRepository.revokeAllByUser(user);
    }

    @Transactional
    public AuthResponse.UserInfo updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> AppException.notFound("User not found."));
        
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setAddress(request.getAddress());
        userRepository.save(user);

        return AuthResponse.UserInfo.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .dateOfBirth(user.getDateOfBirth())
                .address(user.getAddress())
                .cinemaId(user.getCinema() != null ? user.getCinema().getCinemaId() : null)
                .build();
    }

    public AuthResponse.UserInfo getUserInfoByEmail(String email) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> AppException.notFound("User not found."));
        return AuthResponse.UserInfo.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .dateOfBirth(user.getDateOfBirth())
                .address(user.getAddress())
                .cinemaId(user.getCinema() != null ? user.getCinema().getCinemaId() : null)
                .build();
    }

    // =========== Google OAuth ===========

    @Transactional
    public AuthResponse googleLogin(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(java.util.Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                throw AppException.badRequest("Invalid Google ID token.");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String googleUid = payload.getSubject();
            String email = payload.getEmail();
            String fullName = (String) payload.get("name");
            String avatarUrl = (String) payload.get("picture");

            // Find by googleUid first, then by email
            User user = userRepository.findByGoogleUidAndDeletedAtIsNull(googleUid)
                    .or(() -> userRepository.findByEmailAndDeletedAtIsNull(email)
                            .map(u -> { u.setGoogleUid(googleUid); return u; }))
                    .orElseGet(() -> User.builder()
                            .email(email)
                            .fullName(fullName != null ? fullName : email)
                            .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                            .googleUid(googleUid)
                            .avatarUrl(avatarUrl)
                            .role(UserRole.Customer)
                            .status(UserStatus.Active)
                            .failedLoginAttempts(0)
                            .build());

            user.setLastLoginAt(java.time.LocalDateTime.now());
            userRepository.save(user);

            return buildAuthResponse(user);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google login failed", e);
            throw new AppException("INTERNAL_ERROR", "Google login failed: " + e.getMessage(), org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // =========== Private Helpers ===========

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getUserId(), user.getEmail(), user.getRole().name());
        String rawRefreshToken = jwtUtil.generateRefreshToken(user.getUserId());

        // Save hashed refresh token
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(rawRefreshToken))
                .expiresAt(LocalDateTime.now().plusSeconds(jwtUtil.getRefreshTokenExpirationMs() / 1000))
                .isRevoked(false)
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .tokenType("Bearer")
                .user(AuthResponse.UserInfo.builder()
                        .userId(user.getUserId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .avatarUrl(user.getAvatarUrl())
                        .phone(user.getPhone())
                        .dateOfBirth(user.getDateOfBirth())
                        .address(user.getAddress())
                        .cinemaId(user.getCinema() != null ? user.getCinema().getCinemaId() : null)
                        .build())
                .build();
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        // Ensure at least one uppercase, one digit, one special
        sb.append(chars.charAt(random.nextInt(26)));
        sb.append(chars.charAt(26 + random.nextInt(26)));
        sb.append(chars.charAt(52 + random.nextInt(10)));
        sb.append(chars.charAt(62 + random.nextInt(4)));
        for (int i = 4; i < 12; i++) sb.append(chars.charAt(random.nextInt(chars.length())));
        return sb.toString();
    }

    private void saveOtp(User user, String otp, OtpType type) {
        saveOtp(user, otp, type, OTP_VALIDITY_MINUTES);
    }

    private void saveOtp(User user, String otp, OtpType type, int validityMinutes) {
        otpTokenRepository.invalidateAllForUser(user, type);
        OtpToken token = OtpToken.builder()
                .user(user)
                .tokenType(type)
                .tokenValue(passwordEncoder.encode(otp)) // Store hashed
                .expiresAt(LocalDateTime.now().plusMinutes(validityMinutes))
                .isUsed(false)
                .retryCount(0)
                .build();
        otpTokenRepository.save(token);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
