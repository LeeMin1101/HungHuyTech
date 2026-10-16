package com.HungHuyTech.backend.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {
    private Long id;
    private Long warehouseId;
    private String warehouseName;
    private Long variantId;
    private String variantSku;
    private String variantName;

    // Các trường tên sản phẩm và hình ảnh phục vụ cho giao diện quản lý kho
    private String productName;
    private String imageUrl;
    private String productImageUrl;
    private Integer minStockAlert;

    private Integer quantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
    private LocalDateTime updatedAt;
}