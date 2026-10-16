package com.HungHuyTech.backend.payment.controller;

import com.HungHuyTech.backend.common.dto.ApiResponse;
import com.HungHuyTech.backend.payment.dto.PaymentResponse;
import com.HungHuyTech.backend.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Payments", description = "API Quản lý thanh toán đơn hàng (COD, BANK_TRANSFER, VNPAY)")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/api/v1/payments/order/{orderId}")
    @Operation(summary = "Xem thông tin thanh toán của đơn hàng")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentByOrderId(orderId)));
    }

    @PutMapping("/api/v1/admin/payments/order/{orderId}/confirm")
    @Operation(summary = "Xác nhận đơn hàng đã thanh toán thành công (ADMIN/STAFF)")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(
            @PathVariable Long orderId,
            @RequestParam(required = false) String transactionCode
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.confirmPaymentSuccess(orderId, transactionCode),
                "Payment confirmed successfully"
        ));
    }
}