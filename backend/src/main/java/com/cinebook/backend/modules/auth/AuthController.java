package com.cinebook.backend.modules.auth;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.auth.dto.*;
import com.cinebook.backend.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Auth & Account Management APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new account (UC-01)")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        String message = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok(message));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify email OTP (UC-01)")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email/password (UC-02)")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout (UC-05)")
    public ResponseEntity<ApiResponse<String>> logout(@RequestBody(required = false) RefreshTokenRequest request) {
        authService.logout(request != null ? request.getRefreshToken() : null);
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully."));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Send forgot password OTP (UC-03)")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Mã xác thực OTP đã được gửi đến email của bạn."));
    }

    @PostMapping("/verify-forgot-password-otp")
    @Operation(summary = "Verify forgot password OTP")
    public ResponseEntity<ApiResponse<VerifyForgotOtpResponse>> verifyForgotPasswordOtp(
            @Valid @RequestBody VerifyForgotOtpRequest request) {
        String resetToken = authService.verifyForgotPasswordOtp(request);
        return ResponseEntity.ok(ApiResponse.ok(new VerifyForgotOtpResponse(resetToken)));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Mật khẩu của bạn đã được đặt lại thành công."));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password (UC-04)")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công."));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile (UC-07)")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        AuthResponse.UserInfo updatedUser = authService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok(updatedUser));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile (UC-06)")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        AuthResponse.UserInfo userInfo = authService.getUserInfoByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(userInfo));
    }

    @PostMapping("/google-login")
    @Operation(summary = "Login with Google ID Token (UC-02b)")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.googleLogin(request.getIdToken());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
