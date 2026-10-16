package com.HungHuyTech.backend.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class CreateOrderRequest {

    @NotBlank(message = "Recipient name is required")
    private String recipientName;

    @NotBlank(message = "Recipient phone is required")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Invalid phone number format")
    private String recipientPhone;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    @NotBlank(message = "Payment method is required")
    @Pattern(regexp = "^(COD|BANK_TRANSFER|VNPAY)$", message = "Payment method must be COD, BANK_TRANSFER, or VNPAY")
    private String paymentMethod;

    private String couponCode;
    private String note;

    // Thêm trường nhận tổng tiền (nếu cần kiểm tra chéo ở Backend)
    private Double totalAmount;

    // BẮT BUỘC THÊM: Danh sách sản phẩm từ Frontend gửi xuống
    @NotEmpty(message = "Order must contain at least one item")
    private List<@Valid OrderItemRequest> items;

    // Class nội bộ mô phỏng cấu trúc của mỗi sản phẩm trong giỏ hàng
    @Getter
    @Setter
    public static class OrderItemRequest {
        @NotNull(message = "Product ID is required")
        @Positive(message = "Product ID must be positive")
        private Long productId;

        @NotNull(message = "Variant ID is required")
        @Positive(message = "Variant ID must be positive")
        private Long variantId;

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        private Integer quantity;
    }
}