package com.HungHuyTech.backend.product.controller;

import com.HungHuyTech.backend.common.dto.ApiResponse;
import com.HungHuyTech.backend.product.dto.ProductPublicResponse;
import com.HungHuyTech.backend.product.dto.ProductRequest;
import com.HungHuyTech.backend.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@Tag(name = "Admin Product Management", description = "Quản lý sản phẩm dành riêng cho Admin")
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Thêm mới 1 sản phẩm")
    public ResponseEntity<ApiResponse<ProductPublicResponse>> createProduct(
            @RequestBody ProductRequest request) {
        ProductPublicResponse newProduct = productService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.success(newProduct, "Thêm sản phẩm thành công!"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin sản phẩm")
    public ResponseEntity<ApiResponse<ProductPublicResponse>> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        ProductPublicResponse updatedProduct = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedProduct, "Cập nhật sản phẩm thành công!"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa 1 sản phẩm theo ID")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("OK", "Xóa sản phẩm thành công!"));
    }
}