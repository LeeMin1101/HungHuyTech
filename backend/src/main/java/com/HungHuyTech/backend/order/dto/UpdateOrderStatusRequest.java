package com.HungHuyTech.backend.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderStatusRequest {

    @NotBlank(message = "Order status is required")
    @Pattern(
            regexp = "^(CONFIRMED|PROCESSING|SHIPPING|DELIVERED|CANCELLED|RETURNED)$",
            message = "Invalid order status"
    )
    private String status;
}