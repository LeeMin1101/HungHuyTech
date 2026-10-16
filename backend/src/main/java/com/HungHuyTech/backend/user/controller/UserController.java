package com.HungHuyTech.backend.user.controller;

import com.HungHuyTech.backend.common.dto.ApiResponse;
import com.HungHuyTech.backend.user.dto.AddressRequest;
import com.HungHuyTech.backend.user.dto.AddressResponse;
import com.HungHuyTech.backend.user.dto.UpdateProfileRequest;
import com.HungHuyTech.backend.user.dto.UserProfileResponse;
import com.HungHuyTech.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
@Tag(name = "User Profile & Addresses", description = "API Quản lý tài khoản và sổ địa chỉ cá nhân")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Xem thông tin tài khoản đang đăng nhập")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(userService.getMyProfile(authentication.getName())));
    }

    @PutMapping
    @Operation(summary = "Cập nhật thông tin cá nhân")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateMyProfile(authentication.getName(), request),
                "Profile updated successfully"
        ));
    }

    @GetMapping("/addresses")
    @Operation(summary = "Lấy danh sách địa chỉ nhận hàng của tôi")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getMyAddresses(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(userService.getMyAddresses(authentication.getName())));
    }

    @PostMapping("/addresses")
    @Operation(summary = "Thêm địa chỉ nhận hàng mới")
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            Authentication authentication,
            @Valid @RequestBody AddressRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        userService.addAddress(authentication.getName(), request),
                        "Address added successfully"
                ));
    }

    @PutMapping("/addresses/{id}")
    @Operation(summary = "Cập nhật địa chỉ nhận hàng")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateAddress(authentication.getName(), id, request),
                "Address updated successfully"
        ));
    }

    @DeleteMapping("/addresses/{id}")
    @Operation(summary = "Xóa địa chỉ nhận hàng")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            Authentication authentication,
            @PathVariable Long id
    ) {
        userService.deleteAddress(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Address deleted successfully"));
    }
}