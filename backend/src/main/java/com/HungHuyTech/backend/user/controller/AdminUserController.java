package com.HungHuyTech.backend.user.controller;

import com.HungHuyTech.backend.common.dto.ApiResponse;
import com.HungHuyTech.backend.common.dto.PageResponse;
import com.HungHuyTech.backend.user.dto.UpdateUserStatusRequest;
import com.HungHuyTech.backend.user.dto.UserProfileResponse;
import com.HungHuyTech.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - User Management", description = "API Quản lý người dùng dành cho ADMIN")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Lấy danh sách người dùng (có phân trang)")
    public ResponseEntity<ApiResponse<PageResponse<UserProfileResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers(page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết người dùng theo ID")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Khóa / Mở khóa tài khoản người dùng (ACTIVE, INACTIVE, BANNED)")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateUserStatus(id, request),
                "User status updated successfully"
        ));
    }
}