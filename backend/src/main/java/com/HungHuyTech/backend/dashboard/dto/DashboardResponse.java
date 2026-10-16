package com.HungHuyTech.backend.dashboard.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private KpiData kpis;
    private List<ChartData> revenueChart;
    private List<CustomerData> topCustomers;

    @Data @Builder public static class KpiData {
        private BigDecimal totalRevenue;
        private int totalOrders;
        private int lowStockCount;
        private long totalCustomers;
    }

    @Data @Builder public static class ChartData {
        private String name;
        private BigDecimal revenue;
        private int orders;
    }

    @Data @Builder public static class CustomerData {
        private Long id;
        private String name;
        private String phone;
        private BigDecimal totalSpent;
        private int orders;
    }
}