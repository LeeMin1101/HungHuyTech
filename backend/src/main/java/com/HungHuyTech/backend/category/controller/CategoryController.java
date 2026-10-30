package com.HungHuyTech.backend.category.controller;

import com.HungHuyTech.backend.category.dto.AdminCategoryResponse;
import com.HungHuyTech.backend.category.dto.CategoryRequest;
import com.HungHuyTech.backend.category.dto.CategoryResponse;
import com.HungHuyTech.backend.category.service.CategoryService;
import com.HungHuyTech.backend.common.dto.ApiResponse;
import com.HungHuyTech.backend.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.validation.annotation.Validated;

@RestController
@Validated
@RequiredArgsConstructor
@Tag(name = "Categories", description = "API Quản lý danh mục sản phẩm đa cấp")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/api/v1/admin/categories")
    @Operation(summary = "Tìm kiếm và phân trang danh mục cho quản trị")
    public ResponseEntity<ApiResponse<PageResponse<AdminCategoryResponse>>> getAdminCategories(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                categoryService.getAdminCategories(search, active, page, size)
        ));
    }

    @GetMapping("/api/v1/categories")
    @Operation(summary = "Lấy danh sách danh mục đa cấp (Public)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllActiveCategoriesTree()));
    }

    @GetMapping("/api/v1/categories/{id}")
    @Operation(summary = "Xem chi tiết danh mục theo ID (Public)")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id)));
    }

    @PostMapping("/api/v1/admin/categories")
    @Operation(summary = "Tạo danh mục mới (ADMIN/STAFF)")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(categoryService.createCategory(request), "Category created successfully"));
    }

    @PutMapping("/api/v1/admin/categories/{id}")
    @Operation(summary = "Cập nhật danh mục (ADMIN/STAFF)")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                categoryService.updateCategory(id, request),
                "Category updated successfully"
        ));
    }

    @DeleteMapping("/api/v1/admin/categories/{id}")
    @Operation(summary = "Xóa danh mục nếu chưa có sản phẩm (ADMIN/STAFF)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }
}