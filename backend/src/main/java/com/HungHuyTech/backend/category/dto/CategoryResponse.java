package com.HungHuyTech.backend.category.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
public class CategoryResponse {
    private Long id;
    private Long parentId;
    private String parentName;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Integer sortOrder;
    private Boolean isActive;

    @Builder.Default
    private List<CategoryResponse> children = new ArrayList<>();
}