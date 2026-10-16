package com.HungHuyTech.backend.promotion.controller;

import com.HungHuyTech.backend.common.dto.ApiResponse;
import com.HungHuyTech.backend.promotion.dto.CouponResponse;
import com.HungHuyTech.backend.promotion.dto.CouponValidateRequest;
import com.HungHuyTech.backend.promotion.service.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "API Kiểm tra và Áp dụng Mã giảm giá")
public class CouponController {

    private final PromotionService promotionService;

    @PostMapping("/validate")
    @Operation(summary = "Kiểm tra mã giảm giá và tính toán số tiền được giảm")
    public ResponseEntity<ApiResponse<CouponResponse>> validateCoupon(
            @Valid @RequestBody CouponValidateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                promotionService.validateAndCalculateCoupon(request),
                "Coupon is valid"
        ));
    }
}