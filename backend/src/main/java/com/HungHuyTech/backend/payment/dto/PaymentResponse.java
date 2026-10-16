package com.HungHuyTech.backend.payment.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private String orderCode;
    private String paymentMethod;
    private String transactionCode;
    private BigDecimal amount;
    private String status;
    private String paymentUrl; // Dùng khi thanh toán qua VNPAY
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}