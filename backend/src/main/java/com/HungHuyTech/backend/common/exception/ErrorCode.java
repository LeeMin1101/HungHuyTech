package com.HungHuyTech.backend.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 404 Not Found
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Resource not found"),
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "Product not found"),
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "Category not found"),
    BRAND_NOT_FOUND(HttpStatus.NOT_FOUND, "Brand not found"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "Order not found"),
    SERIAL_NOT_FOUND(HttpStatus.NOT_FOUND, "Product serial not found"),

    // 400 Bad Request
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Invalid request"),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Validation error"),
    INSUFFICIENT_STOCK(HttpStatus.BAD_REQUEST, "Insufficient stock in inventory"),
    INVALID_ORDER_STATUS(HttpStatus.BAD_REQUEST, "Invalid order status transition"),
    INVALID_COUPON(HttpStatus.BAD_REQUEST, "Coupon is invalid or expired"),
    PAYMENT_EXCEPTION(HttpStatus.BAD_REQUEST, "Payment processing error"),
    WARRANTY_EXCEPTION(HttpStatus.BAD_REQUEST, "Warranty request is invalid or expired"),

    // 409 Conflict (Trùng lặp dữ liệu)
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "Resource already exists"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Email already exists"),
    SKU_ALREADY_EXISTS(HttpStatus.CONFLICT, "SKU already exists"),

    // 401 & 403 Security
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Invalid email or password, or token expired"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "You do not have permission to access this resource"),

    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");

    private final HttpStatus status;
    private final String defaultMessage;
}