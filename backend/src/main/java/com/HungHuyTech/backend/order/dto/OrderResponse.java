package com.HungHuyTech.backend.order.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponse {
    private Long id;
    private String orderCode;
    private Long userId;
    private String status;
    private String paymentStatus;
    private String shippingStatus;
    private String paymentMethod;
    private String paymentUrl;
    private String recipientName;
    private String recipientPhone;
    private String shippingAddress;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private String note;
    private LocalDateTime createdAt;
    private List<OrderItemDto> items;

    @Getter
    @Builder
    public static class OrderItemDto {
        private Long id;
        private Long variantId;
        private String productName;
        private String variantName;
        private String sku;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discountAmount;
        private BigDecimal totalAmount;

        // Đã bổ sung trường này để trả link ảnh về cho Frontend
        private String productImageUrl;
    }
}