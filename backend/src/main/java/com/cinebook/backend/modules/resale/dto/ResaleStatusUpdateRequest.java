package com.cinebook.backend.modules.resale.dto;

import com.cinebook.backend.modules.resale.entity.ListingStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResaleStatusUpdateRequest {
    private ListingStatus status;
    private String hiddenReason;
    private Long hiddenByAdminId;
}
