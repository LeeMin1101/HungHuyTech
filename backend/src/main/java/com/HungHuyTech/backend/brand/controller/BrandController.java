package com.HungHuyTech.backend.brand.controller;

import com.HungHuyTech.backend.brand.dto.BrandRequest;
import com.HungHuyTech.backend.brand.dto.BrandResponse;
import com.HungHuyTech.backend.brand.service.BrandService;
import com.HungHuyTech.backend.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Brands", description = "API Quản lý thương hiệu sản phẩm")
public class BrandController {

    private final BrandService brandService;

    @GetMapping("/api/v1/brands")
    @Operation(summary = "Lấy danh sách thương hiệu (Public)")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAllBrands() {
        return ResponseEntity.ok(ApiResponse.success(brandService.getAllActiveBrands()));
    }

    @GetMapping("/api/v1/brands/{id}")
    @Operation(summary = "Xem chi tiết thương hiệu (Public)")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(brandService.getBrandById(id)));
    }

    @PostMapping("/api/v1/admin/brands")
    @Operation(summary = "Thêm thương hiệu mới (ADMIN/STAFF)")
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(
            @Valid @RequestBody BrandRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(brandService.createBrand(request), "Brand created successfully"));
    }

    @PutMapping("/api/v1/admin/brands/{id}")
    @Operation(summary = "Cập nhật thương hiệu (ADMIN/STAFF)")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody BrandRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                brandService.updateBrand(id, request),
                "Brand updated successfully"
        ));
    }

    @DeleteMapping("/api/v1/admin/brands/{id}")
    @Operation(summary = "Xóa thương hiệu (ADMIN/STAFF)")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Brand deleted successfully"));
    }
}