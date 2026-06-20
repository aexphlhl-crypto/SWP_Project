package com.cinebook.backend.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String token;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String newPassword;
}
