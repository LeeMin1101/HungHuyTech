package com.HungHuyTech.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    // Đổi lại câu thông báo lỗi cho phù hợp với cả 2 trường hợp
    @NotBlank(message = "Email hoặc Tên đăng nhập không được để trống")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}