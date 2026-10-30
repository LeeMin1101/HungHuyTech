package com.HungHuyTech.backend.brand.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminBrandResponse {
    private Long id;
    private String name;
    private String slug;
    private String logoUrl;
    private String description;
    private Boolean isActive;
    private long productCount;
}
