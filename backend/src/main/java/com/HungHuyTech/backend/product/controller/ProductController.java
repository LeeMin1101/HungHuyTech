package com.HungHuyTech.backend.product.controller;

import com.HungHuyTech.backend.common.dto.ApiResponse;
import com.HungHuyTech.backend.common.dto.PageResponse;
import com.HungHuyTech.backend.product.dto.AttributeRequest;
import com.HungHuyTech.backend.product.dto.AttributeResponse;
import com.HungHuyTech.backend.product.dto.ProductPublicResponse;
import com.HungHuyTech.backend.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1") // Gom chung đường dẫn gốc lên đây để tái sử dụng
@RequiredArgsConstructor
@Tag(name = "Products & Attributes", description = "API Quản lý Sản phẩm, Biến thể SKU, Thuộc tính và Bộ lọc tìm kiếm")
public class ProductController {

    private final ProductService productService;

    // ==========================================
    // PUBLIC APIs (Khách hàng xem & lọc sản phẩm)
    // ==========================================

    @GetMapping("/products")
    @Operation(summary = "Tìm kiếm & Lọc sản phẩm theo từ khóa, danh mục, thương hiệu, khoảng giá, thuộc tính")
    public ResponseEntity<ApiResponse<PageResponse<ProductPublicResponse>>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<Long> attributeValueIds,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                productService.searchPublicProducts(
                        keyword, categoryId, brandId, minPrice, maxPrice, attributeValueIds, sort, page, size
                )
        ));
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "Xem chi tiết sản phẩm kèm các biến thể SKU và hình ảnh")
    public ResponseEntity<ApiResponse<ProductPublicResponse>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductDetailById(id)));
    }

    @GetMapping("/products/attributes")
    @Operation(summary = "Lấy danh sách các thuộc tính lọc (RAM, CPU, GPU...)")
    public ResponseEntity<ApiResponse<List<AttributeResponse>>> getAllAttributes() {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllAttributes()));
    }

    // ==========================================
    // ADMIN APIs (Quản lý thuộc tính)
    // ==========================================

    @PostMapping("/admin/attributes")
    @Operation(summary = "Tạo thuộc tính và các giá trị (VD: RAM -> 8GB, 16GB)")
    public ResponseEntity<ApiResponse<AttributeResponse>> createAttribute(
            @Valid @RequestBody AttributeRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(productService.createAttribute(request), "Attribute created successfully"));
    }
}