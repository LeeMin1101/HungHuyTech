package com.HungHuyTech.backend.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ProductRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Brand ID is required")
    private Long brandId;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Slug is required")
    private String slug;

    @NotBlank(message = "Product SKU is required")
    private String sku;

    private String description;
    private String shortDescription;
    private Integer warrantyMonths = 12;
    private Boolean isFeatured = false;
    private Boolean isActive = true;

    @Valid
    @NotEmpty(message = "At least one product variant is required")
    private List<VariantRequest> variants;

    @Valid
    private List<ImageRequest> images;

    @Getter
    @Setter
    public static class VariantRequest {
        @NotBlank(message = "Variant SKU is required")
        private String sku;

        @NotBlank(message = "Variant name is required")
        private String name;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        private BigDecimal price;

        // --- ĐÂY LÀ TRƯỜNG BẮT BUỘC PHẢI THÊM ĐỂ NHẬN SỐ LƯỢNG TỪ REACT ---
        @NotNull(message = "Stock is required")
        private Integer stock = 0;
        // -----------------------------------------------------------------

        private BigDecimal originalPrice;
        private BigDecimal costPrice;
        private String barcode;
        private BigDecimal weight = BigDecimal.ZERO;
        private Boolean isActive = true;
        private List<Long> attributeValueIds;
    }

    @Getter
    @Setter
    public static class ImageRequest {
        @NotBlank(message = "Image URL is required")
        private String imageUrl;
        private Integer sortOrder = 0;
        private Boolean isPrimary = false;
    }
}