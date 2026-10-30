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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Import các thư viện của Google
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API Đăng ký và Đăng nhập")
public class AuthController {

    private final AuthService authService;

    // Lấy Client ID từ cấu hình application.yml
    @Value("${app.google.client-id}")
    private String GOOGLE_CLIENT_ID;

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

    // API ĐĂNG NHẬP BẰNG GOOGLE
    @PostMapping("/google")
    @Operation(summary = "Đăng nhập bằng Google OAuth2")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        try {
            String credentialToken = payload.get("credential");

            // Cấu hình trình xác minh Google Token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                    .build();

            // Xác minh token
            GoogleIdToken idToken = verifier.verify(credentialToken);

            if (idToken != null) {
                GoogleIdToken.Payload googlePayload = idToken.getPayload();

                // Gọi Service để xử lý tìm/tạo user trong database và sinh JWT token thực tế
                AuthResponse authResponse = authService.googleLogin(googlePayload);

                return ResponseEntity.ok(ApiResponse.success(authResponse, "Google login successful"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("UNAUTHORIZED", "Token Google không hợp lệ"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("INTERNAL_SERVER_ERROR", "Lỗi server khi xác minh Google: " + e.getMessage()));
        }
    }
}