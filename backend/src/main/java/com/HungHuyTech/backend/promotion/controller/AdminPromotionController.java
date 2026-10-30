package com.HungHuyTech.backend.promotion.controller;

import com.HungHuyTech.backend.common.dto.ApiResponse;
import com.HungHuyTech.backend.promotion.service.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/promotions")
@RequiredArgsConstructor
@Tag(name = "Admin Promotions", description = "API Quản lý mã giảm giá cho Admin")
public class AdminPromotionController {

    private final PromotionService promotionService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các mã giảm giá")
    public ResponseEntity<ApiResponse<?>> getAllPromotions() {
        // Viết logic gọi service ở đây
        return ResponseEntity.ok(ApiResponse.success(
                null,
                "Get promotions successfully"
        ));
    }

    @PostMapping
    @Operation(summary = "Tạo mới mã giảm giá")
    public ResponseEntity<ApiResponse<?>> createPromotion(@RequestBody Object request) {
        // Viết logic tạo mới ở đây
        return ResponseEntity.ok(ApiResponse.success(
                null,
                "Promotion created successfully"
        ));
    }
}