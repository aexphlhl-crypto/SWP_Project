package com.cinebook.backend.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    private String phone;
    private LocalDate dateOfBirth;
    private String address;
}
