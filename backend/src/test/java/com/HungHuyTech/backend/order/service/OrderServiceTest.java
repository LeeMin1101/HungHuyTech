package com.HungHuyTech.backend.order.service;

import com.HungHuyTech.backend.cart.repository.CartRepository;
import com.HungHuyTech.backend.common.exception.AppException;
import com.HungHuyTech.backend.order.dto.CreateOrderRequest;
import com.HungHuyTech.backend.order.repository.OrderRepository;
import com.HungHuyTech.backend.payment.service.PaymentService;
import com.HungHuyTech.backend.promotion.service.PromotionService;
import com.HungHuyTech.backend.product.repository.ProductVariantRepository;
import com.HungHuyTech.backend.user.entity.User;
import com.HungHuyTech.backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderServiceTest {

    @Test
    void createOrderLooksUpVariantByVariantIdAndVerifiesProductId() {
        OrderRepository orderRepository = mock(OrderRepository.class);
        CartRepository cartRepository = mock(CartRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        PaymentService paymentService = mock(PaymentService.class);
        PromotionService promotionService = mock(PromotionService.class);
        ProductVariantRepository productVariantRepository = mock(ProductVariantRepository.class);
        OrderService orderService = new OrderService(
                orderRepository,
                cartRepository,
                userRepository,
                paymentService,
                promotionService,
                productVariantRepository
        );

        when(userRepository.findByEmail("customer@example.com"))
                .thenReturn(Optional.of(User.builder().id(1L).build()));
        when(productVariantRepository.findForOrderByIdAndProductId(42L, 7L))
                .thenReturn(Optional.empty());

        CreateOrderRequest.OrderItemRequest item = new CreateOrderRequest.OrderItemRequest();
        item.setProductId(7L);
        item.setVariantId(42L);
        item.setQuantity(1);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setRecipientName("Customer");
        request.setRecipientPhone("0912345678");
        request.setShippingAddress("Test address");
        request.setPaymentMethod("COD");
        request.setItems(List.of(item));

        assertThrows(AppException.class, () -> orderService.createOrder("customer@example.com", request));
        verify(productVariantRepository).findForOrderByIdAndProductId(42L, 7L);
        verify(productVariantRepository, never()).findById(7L);
        verify(orderRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
