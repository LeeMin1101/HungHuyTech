package com.HungHuyTech.backend.cart.service;

import com.HungHuyTech.backend.cart.dto.AddToCartRequest;
import com.HungHuyTech.backend.cart.dto.CartResponse;
import com.HungHuyTech.backend.cart.dto.UpdateCartItemRequest;
import com.HungHuyTech.backend.cart.entity.Cart;
import com.HungHuyTech.backend.cart.entity.CartItem;
import com.HungHuyTech.backend.cart.repository.CartItemRepository;
import com.HungHuyTech.backend.cart.repository.CartRepository;
import com.HungHuyTech.backend.common.exception.AppException;
import com.HungHuyTech.backend.common.exception.ErrorCode;
import com.HungHuyTech.backend.inventory.repository.InventoryRepository;
import com.HungHuyTech.backend.product.entity.ProductVariant;
import com.HungHuyTech.backend.product.repository.ProductVariantRepository;
import com.HungHuyTech.backend.user.entity.User;
import com.HungHuyTech.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryRepository inventoryRepository;

    @Transactional
    public CartResponse getMyCart(String email) {
        Cart cart = getOrCreateCart(email);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse addItemToCart(String email, AddToCartRequest request) {
        Cart cart = getOrCreateCart(email);

        // 1. Kiểm tra Variant tồn tại
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, "Product variant not found"));

        // 2. Kiểm tra Variant và Product đang active (Mục 13 & 27)
        if (!Boolean.TRUE.equals(variant.getIsActive()) || !Boolean.TRUE.equals(variant.getProduct().getIsActive())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Product or variant is currently inactive");
        }

        // 3. Kiểm tra nếu sản phẩm đã có trong giỏ thì cộng dồn số lượng
        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getVariant().getId().equals(variant.getId()))
                .findFirst();

        int targetQuantity = request.getQuantity() + existingItemOpt.map(CartItem::getQuantity).orElse(0);

        // 4. Kiểm tra tồn kho khả dụng đáp ứng số lượng
        int availableStock = inventoryRepository.getTotalAvailableQuantityByVariantId(variant.getId());
        if (availableStock < targetQuantity) {
            throw new AppException(
                    ErrorCode.INSUFFICIENT_STOCK,
                    "Insufficient stock. Available quantity: " + availableStock
            );
        }

        if (existingItemOpt.isPresent()) {
            existingItemOpt.get().setQuantity(targetQuantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(targetQuantity)
                    .build();
            cart.getItems().add(newItem);
        }

        return mapToCartResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse updateCartItem(String email, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(email);
        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Cart item not found"));

        ProductVariant variant = item.getVariant();
        if (!Boolean.TRUE.equals(variant.getIsActive()) || !Boolean.TRUE.equals(variant.getProduct().getIsActive())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Product or variant is currently inactive");
        }

        int availableStock = inventoryRepository.getTotalAvailableQuantityByVariantId(variant.getId());
        if (availableStock < request.getQuantity()) {
            throw new AppException(
                    ErrorCode.INSUFFICIENT_STOCK,
                    "Insufficient stock. Available quantity: " + availableStock
            );
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse removeCartItem(String email, Long itemId) {
        Cart cart = getOrCreateCart(email);
        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Cart item not found"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return mapToCartResponse(cart);
    }

    @Transactional
    public void clearCart(String email) {
        Cart cart = getOrCreateCart(email);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    public Cart getOrCreateCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartResponse.CartItemDto> itemDtos = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalQty = 0;

        for (CartItem item : cart.getItems()) {
            ProductVariant v = item.getVariant();
            BigDecimal lineTotal = v.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            int avail = inventoryRepository.getTotalAvailableQuantityByVariantId(v.getId());

            subtotal = subtotal.add(lineTotal);
            totalQty += item.getQuantity();

            itemDtos.add(CartResponse.CartItemDto.builder()
                    .id(item.getId())
                    .productId(v.getProduct().getId())
                    .productName(v.getProduct().getName())
                    .variantId(v.getId())
                    .variantName(v.getName())
                    .sku(v.getSku())
                    .unitPrice(v.getPrice())
                    .quantity(item.getQuantity())
                    .availableStock(avail)
                    .lineTotal(lineTotal)
                    .build());
        }

        return CartResponse.builder()
                .cartId(cart.getId())
                .totalItems(totalQty)
                .estimatedSubtotal(subtotal)
                .items(itemDtos)
                .build();
    }
}