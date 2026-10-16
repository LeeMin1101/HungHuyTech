package com.HungHuyTech.backend.dashboard.controller;

import com.HungHuyTech.backend.common.dto.ApiResponse;
import com.HungHuyTech.backend.dashboard.dto.DashboardResponse;
import com.HungHuyTech.backend.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "API Thống kê và Báo cáo dành cho Quản trị viên")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Lấy dữ liệu tổng quan, biểu đồ và xếp hạng khách hàng")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboardData(
            @RequestParam(defaultValue = "month") String timeRange
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                dashboardService.getDashboardData(timeRange),
                "Lấy dữ liệu dashboard thành công"
        ));
    }
}