package com.HungHuyTech.backend.promotion.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CouponValidateRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Order subtotal is required")
    @DecimalMin(value = "0.0", message = "Order subtotal must be greater than or equal to 0")
    private BigDecimal orderSubtotal;
}