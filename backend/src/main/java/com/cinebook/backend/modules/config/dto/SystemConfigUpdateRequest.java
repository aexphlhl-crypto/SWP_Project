package com.cinebook.backend.modules.config.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SystemConfigUpdateRequest {
    @NotBlank
    private String configValue;
}
