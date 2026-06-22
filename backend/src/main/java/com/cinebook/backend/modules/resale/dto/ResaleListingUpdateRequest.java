package com.cinebook.backend.modules.resale.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResaleListingUpdateRequest {
    private Integer askingPrice;
    private String note;
}
