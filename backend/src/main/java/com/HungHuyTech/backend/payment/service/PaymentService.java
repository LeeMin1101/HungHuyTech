package com.HungHuyTech.backend.payment.service;

import com.HungHuyTech.backend.common.exception.AppException;
import com.HungHuyTech.backend.common.exception.ErrorCode;
import com.HungHuyTech.backend.order.entity.Order;
import com.HungHuyTech.backend.order.repository.OrderRepository;
import com.HungHuyTech.backend.payment.dto.PaymentResponse;
import com.HungHuyTech.backend.payment.entity.Payment;
import com.HungHuyTech.backend.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public Payment createInitialPayment(Order order, String paymentMethod) {
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(paymentMethod.toUpperCase())
                .amount(order.getTotalAmount())
                .status("PENDING")
                .transactionCode("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();
        return paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Payment not found for order"));
        return mapToResponse(payment);
    }

    // Dành cho Admin/Staff xác nhận đã nhận tiền (Chuyển khoản ngân hàng hoặc COD khi giao xong)
    // Hoặc xử lý từ VNPay Webhook Callback
    @Transactional
    public PaymentResponse confirmPaymentSuccess(Long orderId, String externalTransactionCode) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        Payment payment = paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Payment record not found"));

        if ("COMPLETED".equalsIgnoreCase(payment.getStatus())) {
            throw new AppException(ErrorCode.PAYMENT_EXCEPTION, "Order is already paid");
        }

        if (externalTransactionCode != null && !externalTransactionCode.isBlank()) {
            payment.setTransactionCode(externalTransactionCode.trim());
        }
        payment.setStatus("COMPLETED");
        payment.setPaidAt(LocalDateTime.now());

        order.setPaymentStatus("PAID");
        orderRepository.save(order);

        return mapToResponse(paymentRepository.save(payment));
    }

    public PaymentResponse mapToResponse(Payment payment) {
        String simulatedVnpayUrl = null;
        if ("VNPAY".equalsIgnoreCase(payment.getPaymentMethod()) && "PENDING".equalsIgnoreCase(payment.getStatus())) {
            simulatedVnpayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef="
                    + payment.getOrder().getOrderCode()
                    + "&vnp_Amount=" + payment.getAmount().longValue() * 100;
        }

        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .orderCode(payment.getOrder().getOrderCode())
                .paymentMethod(payment.getPaymentMethod())
                .transactionCode(payment.getTransactionCode())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paymentUrl(simulatedVnpayUrl)
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}