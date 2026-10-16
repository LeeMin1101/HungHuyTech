package com.HungHuyTech.backend.cart.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class CartResponse {
    private Long cartId;
    private Integer totalItems;
    private BigDecimal estimatedSubtotal;
    private List<CartItemDto> items;

    @Getter
    @Builder
    public static class CartItemDto {
        private Long id;
        private Long productId;
        private String productName;
        private Long variantId;
        private String variantName;
        private String sku;
        private BigDecimal unitPrice;
        private Integer quantity;
        private Integer availableStock;
        private BigDecimal lineTotal;
    }
}