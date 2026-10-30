package com.HungHuyTech.backend.category.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminCategoryResponse {
    private Long id;
    private Long parentId;
    private String parentName;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Integer sortOrder;
    private Boolean isActive;
    private long productCount;
}
