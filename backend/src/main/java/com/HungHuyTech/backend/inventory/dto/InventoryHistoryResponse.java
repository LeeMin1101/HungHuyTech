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
public class InventoryHistoryResponse {
    private Long id;
    private String type; // IMPORT, EXPORT, ADJUST
    private Long variantId;
    private String sku;
    private String productName;
    private Integer quantity;
    private String note;
    private LocalDateTime createdAt;
}