package com.HungHuyTech.backend.order.controller;

import com.HungHuyTech.backend.common.dto.ApiResponse;
import com.HungHuyTech.backend.common.dto.PageResponse;
import com.HungHuyTech.backend.order.dto.OrderResponse;
import com.HungHuyTech.backend.order.dto.UpdateOrderStatusRequest;
import com.HungHuyTech.backend.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin Order Management", description = "API quản lý đơn hàng dành riêng cho Admin")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Lấy toàn bộ danh sách đơn hàng trong hệ thống (Có phân trang)")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        PageResponse<OrderResponse> orders = orderService.getAllOrdersForAdmin(page, size);
        return ResponseEntity.ok(ApiResponse.success(orders, "Lấy danh sách đơn hàng thành công"));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái của đơn hàng")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request
    ) {
        OrderResponse updatedOrder = orderService.updateOrderStatusByAdmin(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedOrder, "Cập nhật trạng thái thành công"));
    }
}