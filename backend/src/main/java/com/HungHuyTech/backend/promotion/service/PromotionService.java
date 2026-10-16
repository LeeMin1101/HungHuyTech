package com.HungHuyTech.backend.promotion.service;

import com.HungHuyTech.backend.common.exception.AppException;
import com.HungHuyTech.backend.common.exception.ErrorCode;
import com.HungHuyTech.backend.promotion.dto.CouponResponse;
import com.HungHuyTech.backend.promotion.dto.CouponValidateRequest;
import com.HungHuyTech.backend.promotion.entity.Coupon;
import com.HungHuyTech.backend.promotion.entity.Promotion;
import com.HungHuyTech.backend.promotion.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public CouponResponse validateAndCalculateCoupon(CouponValidateRequest request) {
        Coupon coupon = getValidCoupon(request.getCode());
        Promotion promotion = coupon.getPromotion();

        // 1. Kiểm tra đơn hàng có đạt giá trị tối thiểu không
        if (request.getOrderSubtotal().compareTo(promotion.getMinOrderValue()) < 0) {
            throw new AppException(
                    ErrorCode.INVALID_COUPON,
                    "Order subtotal must be at least " + promotion.getMinOrderValue() + " to use this coupon"
            );
        }

        // 2. Tính toán số tiền được giảm
        BigDecimal discountAmount = calculateDiscount(promotion, request.getOrderSubtotal());
        BigDecimal newTotal = request.getOrderSubtotal().subtract(discountAmount).max(BigDecimal.ZERO);

        return CouponResponse.builder()
                .code(coupon.getCode())
                .promotionName(promotion.getName())
                .discountType(promotion.getDiscountType())
                .discountValue(promotion.getDiscountValue())
                .maxDiscount(promotion.getMaxDiscount())
                .calculatedDiscountAmount(discountAmount)
                .newTotalAmount(newTotal)
                .build();
    }

    @Transactional
    public BigDecimal applyCouponToOrder(String code, BigDecimal orderSubtotal) {
        if (code == null || code.isBlank()) return BigDecimal.ZERO;

        Coupon coupon = getValidCoupon(code);
        Promotion promotion = coupon.getPromotion();

        if (orderSubtotal.compareTo(promotion.getMinOrderValue()) < 0) {
            throw new AppException(ErrorCode.INVALID_COUPON, "Order subtotal does not meet the minimum value requirement");
        }

        // Tăng số lượt sử dụng
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        return calculateDiscount(promotion, orderSubtotal);
    }

    private Coupon getValidCoupon(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Coupon code not found"));

        LocalDateTime now = LocalDateTime.now();

        // Kiểm tra trạng thái và hạn sử dụng của Coupon
        if (!Boolean.TRUE.equals(coupon.getIsActive()) ||
                now.isBefore(coupon.getStartDate()) ||
                now.isAfter(coupon.getEndDate())) {
            throw new AppException(ErrorCode.INVALID_COUPON, "Coupon is inactive or expired");
        }

        // Kiểm tra giới hạn lượt dùng của Coupon
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new AppException(ErrorCode.INVALID_COUPON, "Coupon usage limit has been reached");
        }

        Promotion promotion = coupon.getPromotion();

        // Kiểm tra trạng thái và hạn sử dụng của Chương trình Khuyến mãi
        if (!Boolean.TRUE.equals(promotion.getIsActive()) ||
                now.isBefore(promotion.getStartDate()) ||
                now.isAfter(promotion.getEndDate())) {
            throw new AppException(ErrorCode.INVALID_COUPON, "The associated promotion has ended");
        }

        return coupon;
    }

    private BigDecimal calculateDiscount(Promotion promotion, BigDecimal orderSubtotal) {
        BigDecimal discount = BigDecimal.ZERO;

        if ("PERCENTAGE".equalsIgnoreCase(promotion.getDiscountType())) {
            discount = orderSubtotal.multiply(promotion.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (promotion.getMaxDiscount() != null && discount.compareTo(promotion.getMaxDiscount()) > 0) {
                discount = promotion.getMaxDiscount();
            }
        } else if ("FIXED_AMOUNT".equalsIgnoreCase(promotion.getDiscountType())) {
            discount = promotion.getDiscountValue();
        }

        return discount.min(orderSubtotal); // Không giảm âm tiền đơn hàng
    }
}