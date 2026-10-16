package com.HungHuyTech.backend.category.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequest {

    private Long parentId;

    @NotBlank(message = "Category name is required")
    private String name;

    @NotBlank(message = "Slug is required")
    private String slug;

    private String description;
    private String imageUrl;
    private Integer sortOrder = 0;
    private Boolean isActive = true;
}