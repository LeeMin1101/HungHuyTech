package com.HungHuyTech.backend.auth.controller;

import com.HungHuyTech.backend.auth.dto.AuthResponse;
import com.HungHuyTech.backend.auth.dto.LoginRequest;
import com.HungHuyTech.backend.auth.dto.RegisterRequest;
import com.HungHuyTech.backend.auth.service.AuthService;
import com.HungHuyTech.backend.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API Đăng ký và Đăng nhập")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản khách hàng mới (Mặc định gán quyền CUSTOMER)")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        AuthResponse.UserInfo userInfo = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(userInfo, "User registered successfully"));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập và nhận JWT Access Token cho User")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Login successful"));
    }

    // API ĐĂNG NHẬP DÀNH RIÊNG CHO ADMIN
    @PostMapping("/admin/login")
    @Operation(summary = "Đăng nhập dành riêng cho Quản trị viên (Yêu cầu quyền ADMIN)")
    public ResponseEntity<ApiResponse<AuthResponse>> adminLogin(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse authResponse = authService.adminLogin(request);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Admin login successful"));
    }
}