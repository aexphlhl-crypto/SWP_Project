package com.cinebook.backend.modules.fnb.dto;

import com.cinebook.backend.modules.fnb.entity.FnBProductCategory;
import com.cinebook.backend.modules.fnb.entity.FnBProductStatus;
import lombok.Data;

@Data
public class FnBProductRequest {
    private String name;
    private String description;
    private FnBProductCategory category;
    private Integer price;
    private String imageUrl;
    private FnBProductStatus status;
}
