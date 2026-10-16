package com.HungHuyTech.backend.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateSerialRequest {

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @NotNull(message = "Variant ID is required")
    private Long variantId;

    @NotBlank(message = "Serial number is required")
    private String serialNumber;
}