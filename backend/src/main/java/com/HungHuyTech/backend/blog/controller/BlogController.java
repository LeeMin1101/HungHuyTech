package com.HungHuyTech.backend.blog.controller;

import com.HungHuyTech.backend.blog.dto.BlogRequest;
import com.HungHuyTech.backend.blog.dto.BlogResponse;
import com.HungHuyTech.backend.blog.service.BlogService;
import com.HungHuyTech.backend.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/blogs")
@RequiredArgsConstructor
@Tag(name = "Admin - Blogs", description = "Quản lý tin tức và bài viết")
public class BlogController {

    private final BlogService blogService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả bài viết")
    public ResponseEntity<ApiResponse<List<BlogResponse>>> getAllBlogs() {
        return ResponseEntity.ok(ApiResponse.success(blogService.getAllBlogs()));
    }

    @PostMapping
    @Operation(summary = "Tạo bài viết mới")
    public ResponseEntity<ApiResponse<BlogResponse>> createBlog(@Valid @RequestBody BlogRequest request) {
        return ResponseEntity.ok(ApiResponse.success(blogService.createBlog(request), "Đăng bài viết thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật bài viết")
    public ResponseEntity<ApiResponse<BlogResponse>> updateBlog(
            @PathVariable Long id,
            @Valid @RequestBody BlogRequest request) {
        return ResponseEntity.ok(ApiResponse.success(blogService.updateBlog(id, request), "Cập nhật bài viết thành công"));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Ẩn/Hiện/Lưu nháp bài viết")
    public ResponseEntity<ApiResponse<String>> updateBlogStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        blogService.updateBlogStatus(id, payload.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Trạng thái đã được cập nhật", "Cập nhật thành công"));
    }
}