package com.HungHuyTech.backend.cart.controller;

import com.HungHuyTech.backend.cart.dto.AddToCartRequest;
import com.HungHuyTech.backend.cart.dto.CartResponse;
import com.HungHuyTech.backend.cart.dto.UpdateCartItemRequest;
import com.HungHuyTech.backend.cart.service.CartService;
import com.HungHuyTech.backend.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Shopping Cart", description = "API Quản lý giỏ hàng của khách hàng")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Xem giỏ hàng hiện tại")
    public ResponseEntity<ApiResponse<CartResponse>> getMyCart(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getMyCart(authentication.getName())));
    }

    @PostMapping("/items")
    @Operation(summary = "Thêm sản phẩm (Variant) vào giỏ hàng")
    public ResponseEntity<ApiResponse<CartResponse>> addItemToCart(
            Authentication authentication,
            @Valid @RequestBody AddToCartRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                cartService.addItemToCart(authentication.getName(), request),
                "Item added to cart"
        ));
    }

    @PutMapping("/items/{id}")
    @Operation(summary = "Cập nhật số lượng sản phẩm trong giỏ hàng")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                cartService.updateCartItem(authentication.getName(), id, request),
                "Cart item updated"
        ));
    }

    @DeleteMapping("/items/{id}")
    @Operation(summary = "Xóa 1 sản phẩm khỏi giỏ hàng")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                cartService.removeCartItem(authentication.getName(), id),
                "Item removed from cart"
        ));
    }

    @DeleteMapping
    @Operation(summary = "Làm trống toàn bộ giỏ hàng")
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication authentication) {
        cartService.clearCart(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Cart cleared successfully"));
    }
}