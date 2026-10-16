package com.HungHuyTech.backend.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryAdjustRequest {

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @NotNull(message = "Variant ID is required")
    private Long variantId;

    @NotBlank(message = "Transaction type is required")
    @Pattern(regexp = "^(IMPORT|ADJUSTMENT|RETURN)$", message = "Type must be IMPORT, ADJUSTMENT, or RETURN")
    private String transactionType;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String note;
}