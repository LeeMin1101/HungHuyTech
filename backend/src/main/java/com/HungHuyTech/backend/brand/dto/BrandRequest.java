package com.HungHuyTech.backend.brand.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BrandRequest {

    @NotBlank(message = "Brand name is required")
    private String name;

    @NotBlank(message = "Slug is required")
    private String slug;

    private String logoUrl;
    private String description;
    private Boolean isActive = true;
}