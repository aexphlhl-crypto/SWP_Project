package com.cinebook.backend.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChartResponse {
    private String label;
    private Integer value;
    private Integer tickets;

    public ChartResponse(String label, Integer value) {
        this.label = label;
        this.value = value;
        this.tickets = 0;
    }
}
