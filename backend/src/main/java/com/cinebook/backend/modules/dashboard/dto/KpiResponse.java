package com.cinebook.backend.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KpiResponse {
    private Integer totalRevenue;
    private Integer totalTickets;
    private Long newUsers;
}
