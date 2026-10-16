package com.HungHuyTech.backend.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @NotNull(message = "Hãng không được để trống")
    private Long brandId;

    @NotNull(message = "Giá bán không được để trống")
    private BigDecimal minPrice;

    @NotBlank(message = "Link ảnh đại diện không được để trống")
    private String primaryImageUrl;

    private String shortDescription;
}