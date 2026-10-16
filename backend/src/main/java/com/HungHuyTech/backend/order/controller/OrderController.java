package com.HungHuyTech.backend.order.controller;

import com.HungHuyTech.backend.common.dto.ApiResponse;
import com.HungHuyTech.backend.common.dto.PageResponse;
import com.HungHuyTech.backend.order.dto.CreateOrderRequest;
import com.HungHuyTech.backend.order.dto.OrderResponse;
import com.HungHuyTech.backend.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Orders", description = "API Đặt hàng (Checkout), Lịch sử đơn hàng và Quản lý trạng thái đơn")
public class OrderController {

    private final OrderService orderService;
    // CUSTOMER APIs

    @PostMapping("/api/v1/orders")
    @Operation(summary = "Đặt hàng (Checkout) từ giỏ hàng hiện tại")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        orderService.createOrder(authentication.getName(), request),
                        "Order created successfully"
                ));
    }

    // ĐÃ SỬA Ở ĐÂY: Thêm "/my-orders" để khớp với URL mà frontend đang gọi
    @GetMapping("/api/v1/orders/my-orders")
    @Operation(summary = "Xem danh sách đơn hàng của tôi (có phân trang)")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getMyOrders(authentication.getName(), page, size)
        ));
    }

    @GetMapping("/api/v1/orders/{id}")
    @Operation(summary = "Xem chi tiết đơn hàng của tôi")
    public ResponseEntity<ApiResponse<OrderResponse>> getMyOrderById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getMyOrderById(authentication.getName(), id)
        ));
    }

    @PostMapping("/api/v1/orders/{id}/cancel")
    @Operation(summary = "Khách hàng hủy đơn hàng (Khi đang ở trạng thái PENDING)")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelMyOrder(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.cancelMyOrder(authentication.getName(), id),
                "Order cancelled and stock released successfully"
        ));
    }
}