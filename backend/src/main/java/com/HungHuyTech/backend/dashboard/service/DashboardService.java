package com.HungHuyTech.backend.dashboard.service;

import com.HungHuyTech.backend.dashboard.dto.DashboardResponse;
import com.HungHuyTech.backend.order.entity.Order;
import com.HungHuyTech.backend.order.repository.OrderRepository;
import com.HungHuyTech.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public DashboardResponse getDashboardData(String timeRange) {
        LocalDateTime now = LocalDateTime.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();

        // 1. Lấy toàn bộ đơn hàng và lọc theo thời gian (Tháng này hoặc Năm nay)
        List<Order> allOrders = orderRepository.findAll();
        List<Order> filteredOrders = allOrders.stream().filter(o -> {
            if (o.getCreatedAt() == null) return false;
            if ("month".equalsIgnoreCase(timeRange)) {
                return o.getCreatedAt().getYear() == currentYear && o.getCreatedAt().getMonthValue() == currentMonth;
            }
            return o.getCreatedAt().getYear() == currentYear;
        }).collect(Collectors.toList());

        // 2. Tính toán KPIs
        BigDecimal totalRev = filteredOrders.stream()
                .filter(o -> Arrays.asList("COMPLETED", "DELIVERED").contains(o.getStatus().toUpperCase()))
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalOrders = filteredOrders.size();
        long totalCustomers = userRepository.count();

        // 3. Xử lý Dữ liệu Biểu đồ (12 tháng trong năm hiện tại)
        List<DashboardResponse.ChartData> chartDataList = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            final int month = i;
            List<Order> monthOrders = allOrders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().getYear() == currentYear && o.getCreatedAt().getMonthValue() == month)
                    .collect(Collectors.toList());

            BigDecimal monthRev = monthOrders.stream()
                    .filter(o -> Arrays.asList("COMPLETED", "DELIVERED").contains(o.getStatus().toUpperCase()))
                    .map(Order::getTotalAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            chartDataList.add(DashboardResponse.ChartData.builder()
                    .name("T" + month)
                    .revenue(monthRev)
                    .orders(monthOrders.size())
                    .build());
        }

        // 4. Bảng xếp hạng khách hàng VIP (Top 5 khách hàng chi tiêu nhiều nhất)
        Map<Long, DashboardResponse.CustomerData> customerStats = new HashMap<>();
        for (Order o : filteredOrders) {
            if (o.getUser() == null || !Arrays.asList("COMPLETED", "DELIVERED").contains(o.getStatus().toUpperCase())) continue;

            Long userId = o.getUser().getId();
            DashboardResponse.CustomerData stat = customerStats.getOrDefault(userId,
                    DashboardResponse.CustomerData.builder()
                            .id(userId).name(o.getRecipientName()).phone(o.getRecipientPhone())
                            .totalSpent(BigDecimal.ZERO).orders(0).build()
            );

            stat.setTotalSpent(stat.getTotalSpent().add(o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO));
            stat.setOrders(stat.getOrders() + 1);
            customerStats.put(userId, stat);
        }

        List<DashboardResponse.CustomerData> topCustomers = customerStats.values().stream()
                .sorted((a, b) -> b.getTotalSpent().compareTo(a.getTotalSpent()))
                .limit(5)
                .collect(Collectors.toList());

        // 5. Đóng gói kết quả
        return DashboardResponse.builder()
                .kpis(DashboardResponse.KpiData.builder()
                        .totalRevenue(totalRev)
                        .totalOrders(totalOrders)
                        .lowStockCount(0) // Mặc định 0, tính logic tồn kho sau
                        .totalCustomers(totalCustomers)
                        .build())
                .revenueChart(chartDataList)
                .topCustomers(topCustomers)
                .build();
    }
}