package com.cinebook.backend.modules.config.service;

import com.cinebook.backend.modules.config.entity.SystemConfig;
import com.cinebook.backend.modules.config.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemConfigService {
    private final SystemConfigRepository systemConfigRepository;

    public String getConfigValue(String key) {
        return systemConfigRepository.findByConfigKey(key)
                .map(SystemConfig::getConfigValue)
                .orElse(null);
    }

    public BigDecimal getVatRate() {
        String val = getConfigValue("vat_rate");
        return val != null ? new BigDecimal(val) : BigDecimal.valueOf(0.10);
    }

    public BigDecimal getSeatVipMultiplier() {
        String val = getConfigValue("seat_vip_multiplier");
        return val != null ? new BigDecimal(val) : BigDecimal.valueOf(1.50);
    }

    public BigDecimal getSeatCoupleMultiplier() {
        String val = getConfigValue("seat_couple_multiplier");
        return val != null ? new BigDecimal(val) : BigDecimal.valueOf(2.00);
    }

    public BigDecimal getRoom3DMultiplier() {
        String val = getConfigValue("room_3d_multiplier");
        return val != null ? new BigDecimal(val) : BigDecimal.valueOf(1.20);
    }

    public BigDecimal getRoomIMAXMultiplier() {
        String val = getConfigValue("room_imax_multiplier");
        return val != null ? new BigDecimal(val) : BigDecimal.valueOf(1.50);
    }

    public int getSeatHoldMinutes() {
        String val = getConfigValue("seat_hold_minutes");
        return val != null ? Integer.parseInt(val) : 10;
    }

    public BigDecimal getBasePrice() {
        String val = getConfigValue("base_price");
        return val != null ? new BigDecimal(val) : BigDecimal.valueOf(75000);
    }

    public String getEveningSurchargeTime() {
        String val = getConfigValue("evening_surcharge_time");
        return val != null ? val : "17:00";
    }

    public BigDecimal getEveningSurchargePercent() {
        String val = getConfigValue("evening_surcharge_percent");
        return val != null ? new BigDecimal(val) : BigDecimal.valueOf(10);
    }

    public BigDecimal getWeekendSurchargePercent() {
        String val = getConfigValue("weekend_surcharge_percent");
        return val != null ? new BigDecimal(val) : BigDecimal.valueOf(20);
    }

    public List<SystemConfig> getAllConfigs() {
        return systemConfigRepository.findAll();
    }

    public SystemConfig updateConfig(String key, String value) {
        SystemConfig config = systemConfigRepository.findByConfigKey(key)
                .orElseGet(() -> {
                    SystemConfig newConfig = new SystemConfig();
                    newConfig.setConfigKey(key);
                    // default type is String
                    return newConfig;
                });
        config.setConfigValue(value);
        return systemConfigRepository.save(config);
    }
}
