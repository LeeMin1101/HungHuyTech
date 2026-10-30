package com.HungHuyTech.backend.product.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ProductPublicResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private String name;
    private String slug;
    private String sku;
    private String shortDescription;
    private String description;
    private Integer warrantyMonths;
    private Boolean isFeatured;
    private Boolean isFlashSale;
    private LocalDateTime flashSaleEnd;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String primaryImageUrl;
    private List<VariantPublicDto> variants;
    private List<ImageDto> images;

    @Getter
    @Builder
    public static class VariantPublicDto {
        private Long id;
        private String sku;
        private String name;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private BigDecimal weight;
        private Boolean isActive;

        // --- BỔ SUNG TRƯỜNG STOCK VÀO ĐÂY ĐỂ ĐỒNG BỘ ---
        private Integer stock;

        private List<AttributeItemDto> attributes;
    }

    @Getter
    @Builder
    public static class AttributeItemDto {
        private Long attributeId;
        private String attributeName;
        private Long attributeValueId;
        private String value;
    }

    @Getter
    @Builder
    public static class ImageDto {
        private Long id;
        private String imageUrl;
        private Integer sortOrder;
        private Boolean isPrimary;
    }
}