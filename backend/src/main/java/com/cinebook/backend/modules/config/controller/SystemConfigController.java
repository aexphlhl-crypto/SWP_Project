package com.cinebook.backend.modules.config.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.config.dto.SystemConfigUpdateRequest;
import com.cinebook.backend.modules.config.entity.SystemConfig;
import com.cinebook.backend.modules.config.service.SystemConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<List<SystemConfig>> getAllConfigs() {
        return ApiResponse.ok(systemConfigService.getAllConfigs());
    }

    @PutMapping("/{configKey}")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<SystemConfig> updateConfig(
            @PathVariable String configKey,
            @RequestBody @Valid SystemConfigUpdateRequest request) {
        return ApiResponse.ok(systemConfigService.updateConfig(configKey, request.getConfigValue()));
    }
}
