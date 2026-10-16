package com.HungHuyTech.backend.promotion.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class CouponResponse {
    private String code;
    private String promotionName;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscount;
    private BigDecimal calculatedDiscountAmount;
    private BigDecimal newTotalAmount;
}