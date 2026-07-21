package com.cinebook.backend.modules.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255)
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':,./<>?]).{8,}$",
        message = "Password must be at least 8 characters with uppercase, number and special character"
    )
    private String password;

    private String phone;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
}
