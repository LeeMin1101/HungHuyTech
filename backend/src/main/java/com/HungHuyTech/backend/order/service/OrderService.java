package com.HungHuyTech.backend.order.service;

import com.HungHuyTech.backend.cart.entity.Cart;
import com.HungHuyTech.backend.cart.repository.CartRepository;
import com.HungHuyTech.backend.common.dto.PageResponse;
import com.HungHuyTech.backend.common.exception.AppException;
import com.HungHuyTech.backend.common.exception.ErrorCode;
import com.HungHuyTech.backend.order.dto.CreateOrderRequest;
import com.HungHuyTech.backend.order.dto.OrderResponse;
import com.HungHuyTech.backend.order.dto.UpdateOrderStatusRequest;
import com.HungHuyTech.backend.order.entity.Order;
import com.HungHuyTech.backend.order.entity.OrderItem;
import com.HungHuyTech.backend.order.repository.OrderRepository;
import com.HungHuyTech.backend.payment.dto.PaymentResponse;
import com.HungHuyTech.backend.payment.entity.Payment;
import com.HungHuyTech.backend.payment.service.PaymentService;
import com.HungHuyTech.backend.product.entity.ProductVariant;
import com.HungHuyTech.backend.product.repository.ProductVariantRepository;
import com.HungHuyTech.backend.promotion.service.PromotionService;
import com.HungHuyTech.backend.user.entity.User;
import com.HungHuyTech.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    // Đã xóa bỏ InventoryService
    private final PaymentService paymentService;
    private final PromotionService promotionService;
    private final ProductVariantRepository productVariantRepository;

    // Rules for valid order status transitions
    private static final Map<String, Set<String>> VALID_STATUS_TRANSITIONS = Map.of(
            "PENDING", Set.of("CONFIRMED", "CANCELLED"),
            "CONFIRMED", Set.of("PROCESSING", "CANCELLED"),
            "PROCESSING", Set.of("SHIPPING", "CANCELLED"),
            "SHIPPING", Set.of("DELIVERED", "RETURNED"),
            "DELIVERED", Set.of("RETURNED"),
            "CANCELLED", Set.of(),
            "RETURNED", Set.of()
    );

    @Transactional
    public OrderResponse createOrder(String email, CreateOrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Cannot create order with an empty item list");
        }

        String orderCode = generateOrderCode();

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .status("PENDING")
                .paymentStatus("UNPAID")
                .shippingStatus("NOT_SHIPPED")
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .shippingAddress(request.getShippingAddress())
                .note(request.getNote())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CreateOrderRequest.OrderItemRequest reqItem : request.getItems()) {
            ProductVariant variant = productVariantRepository
                    .findForOrderByIdAndProductId(reqItem.getVariantId(), reqItem.getProductId())
                    .orElseThrow(() -> new AppException(
                            ErrorCode.BAD_REQUEST,
                            "Variant " + reqItem.getVariantId() +
                                    " does not belong to product " + reqItem.getProductId()
                    ));

            if (!Boolean.TRUE.equals(variant.getIsActive()) || !Boolean.TRUE.equals(variant.getProduct().getIsActive())) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Product is no longer active: " + variant.getName());
            }

            // --- KIỂM TRA VÀ TRỪ TỒN KHO TRỰC TIẾP ---
            int currentStock = variant.getStock() != null ? variant.getStock() : 0;
            if (currentStock < reqItem.getQuantity()) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Sản phẩm " + variant.getName() + " không đủ số lượng trong kho!");
            }
            variant.setStock(currentStock - reqItem.getQuantity());
            productVariantRepository.save(variant);
            // ----------------------------------------

            BigDecimal currentUnitPrice = variant.getPrice();
            BigDecimal lineTotal = currentUnitPrice.multiply(BigDecimal.valueOf(reqItem.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .variant(variant)
                    .productName(variant.getProduct().getName())
                    .variantName(variant.getName())
                    .sku(variant.getSku())
                    .quantity(reqItem.getQuantity())
                    .unitPrice(currentUnitPrice)
                    .discountAmount(BigDecimal.ZERO)
                    .totalAmount(lineTotal)
                    .build();

            order.getItems().add(orderItem);
        }

        BigDecimal shippingFee = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            discountAmount = promotionService.applyCouponToOrder(request.getCouponCode(), subtotal);
        }

        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(shippingFee);

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        Payment payment = paymentService.createInitialPayment(savedOrder, request.getPaymentMethod());
        PaymentResponse paymentInfo = paymentService.mapToResponse(payment);

        // Clear the user's DB cart after a successful checkout
        Optional<Cart> cartOpt = cartRepository.findByUserId(user.getId());
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cart.getItems().clear();
            cartRepository.save(cart);
        }

        return mapToOrderResponse(savedOrder, paymentInfo);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getMyOrders(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> pageData = orderRepository.findByUserId(user.getId(), pageable)
                .map(order -> mapToOrderResponse(order, getPaymentInfoSafe(order.getId())));

        return PageResponse.from(pageData);
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrderById(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        return mapToOrderResponse(order, getPaymentInfoSafe(order.getId()));
    }

    @Transactional
    public OrderResponse cancelMyOrder(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new AppException(
                    ErrorCode.INVALID_ORDER_STATUS,
                    "Only PENDING orders can be cancelled. Current status: " + order.getStatus()
            );
        }

        order.setStatus("CANCELLED");
        Order savedOrder = orderRepository.save(order);

        // --- HOÀN LẠI TỒN KHO KHI USER HỦY ĐƠN ---
        for (OrderItem item : savedOrder.getItems()) {
            ProductVariant variant = item.getVariant();
            int currentStock = variant.getStock() != null ? variant.getStock() : 0;
            variant.setStock(currentStock + item.getQuantity());
            productVariantRepository.save(variant);
        }

        return mapToOrderResponse(savedOrder, getPaymentInfoSafe(savedOrder.getId()));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrdersForAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> pageData = orderRepository.findAll(pageable)
                .map(order -> mapToOrderResponse(order, getPaymentInfoSafe(order.getId())));
        return PageResponse.from(pageData);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdForAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return mapToOrderResponse(order, getPaymentInfoSafe(order.getId()));
    }

    @Transactional
    public OrderResponse updateOrderStatusByAdmin(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        String currentStatus = order.getStatus().toUpperCase();
        String targetStatus = request.getStatus().toUpperCase();

        Set<String> allowedNextStatuses = VALID_STATUS_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowedNextStatuses.contains(targetStatus)) {
            throw new AppException(
                    ErrorCode.INVALID_ORDER_STATUS,
                    "Cannot transition order status from " + currentStatus + " to " + targetStatus
            );
        }

        order.setStatus(targetStatus);
        if ("SHIPPING".equals(targetStatus)) {
            order.setShippingStatus("SHIPPING");
        } else if ("DELIVERED".equals(targetStatus)) {
            order.setShippingStatus("DELIVERED");
            if ("UNPAID".equalsIgnoreCase(order.getPaymentStatus())) {
                order.setPaymentStatus("PAID");
            }
        } else if ("CANCELLED".equals(targetStatus)) {
            // --- HOÀN LẠI TỒN KHO KHI ADMIN HỦY ĐƠN ---
            for (OrderItem item : order.getItems()) {
                ProductVariant variant = item.getVariant();
                int currentStock = variant.getStock() != null ? variant.getStock() : 0;
                variant.setStock(currentStock + item.getQuantity());
                productVariantRepository.save(variant);
            }
        }

        Order savedOrder = orderRepository.save(order);
        return mapToOrderResponse(savedOrder, getPaymentInfoSafe(savedOrder.getId()));
    }

    private PaymentResponse getPaymentInfoSafe(Long orderId) {
        try {
            return paymentService.getPaymentByOrderId(orderId);
        } catch (Exception e) {
            return null;
        }
    }

    private String generateOrderCode() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        int randomPart = ThreadLocalRandom.current().nextInt(100000, 999999);
        return "HH-" + datePart + "-" + randomPart;
    }

    private OrderResponse mapToOrderResponse(Order order, PaymentResponse paymentInfo) {
        List<OrderResponse.OrderItemDto> itemDtos = order.getItems().stream()
                .map(i -> {
                    // Trích xuất link ảnh từ Product/Variant để trả về Frontend
                    String imageUrl = null;
                    if (i.getVariant() != null && i.getVariant().getProduct() != null) {
                        imageUrl = i.getVariant().getProduct().getPrimaryImageUrl();
                    }

                    return OrderResponse.OrderItemDto.builder()
                            .id(i.getId())
                            .variantId(i.getVariant().getId())
                            .productName(i.getProductName())
                            .variantName(i.getVariantName())
                            .sku(i.getSku())
                            .quantity(i.getQuantity())
                            .unitPrice(i.getUnitPrice())
                            .discountAmount(i.getDiscountAmount())
                            .totalAmount(i.getTotalAmount())
                            .productImageUrl(imageUrl) // Gắn thêm link ảnh sản phẩm
                            .build();
                })
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUser().getId())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .shippingStatus(order.getShippingStatus())
                .paymentMethod(paymentInfo != null ? paymentInfo.getPaymentMethod() : null)
                .paymentUrl(paymentInfo != null ? paymentInfo.getPaymentUrl() : null)
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .shippingAddress(order.getShippingAddress())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .items(itemDtos)
                .build();
    }
}