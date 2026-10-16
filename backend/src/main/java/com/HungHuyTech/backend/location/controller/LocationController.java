package com.HungHuyTech.backend.location.controller;

import com.HungHuyTech.backend.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
@Tag(name = "Locations", description = "API Lấy dữ liệu Hành chính Tỉnh/Quận/Phường")
public class LocationController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/provinces")
    @Operation(summary = "Lấy danh sách Tỉnh / Thành phố")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProvinces() {
        try {
            String sql = "SELECT code, name FROM provinces ORDER BY name ASC";
            List<Map<String, Object>> provinces = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(ApiResponse.success(provinces));
        } catch (Exception e) {
            e.printStackTrace();
            // Thêm tham số thứ 2 ("INTERNAL_SERVER_ERROR") để khớp với thiết kế của ApiResponse
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi truy xuất bảng provinces: " + e.getMessage(), "INTERNAL_SERVER_ERROR"));
        }
    }

    @GetMapping("/districts/{provinceCode}")
    @Operation(summary = "Lấy danh sách Quận / Huyện theo mã Tỉnh")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDistricts(@PathVariable String provinceCode) {
        try {
            String sql = "SELECT code, name FROM districts WHERE province_code = ? ORDER BY name ASC";
            List<Map<String, Object>> districts = jdbcTemplate.queryForList(sql, provinceCode);
            return ResponseEntity.ok(ApiResponse.success(districts));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi truy xuất bảng districts: " + e.getMessage(), "INTERNAL_SERVER_ERROR"));
        }
    }

    @GetMapping("/wards/{districtCode}")
    @Operation(summary = "Lấy danh sách Phường / Xã theo mã Quận")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getWards(@PathVariable String districtCode) {
        try {
            String sql = "SELECT code, name FROM wards WHERE district_code = ? ORDER BY name ASC";
            List<Map<String, Object>> wards = jdbcTemplate.queryForList(sql, districtCode);
            return ResponseEntity.ok(ApiResponse.success(wards));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi truy xuất bảng wards: " + e.getMessage(), "INTERNAL_SERVER_ERROR"));
        }
    }
}