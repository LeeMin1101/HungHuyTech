package com.HungHuyTech.backend.auth.service;

import com.HungHuyTech.backend.auth.dto.AuthResponse;
import com.HungHuyTech.backend.auth.dto.LoginRequest;
import com.HungHuyTech.backend.auth.dto.RegisterRequest;
import com.HungHuyTech.backend.common.exception.AppException;
import com.HungHuyTech.backend.common.exception.ErrorCode;
import com.HungHuyTech.backend.security.JwtTokenProvider;
import com.HungHuyTech.backend.user.entity.Role;
import com.HungHuyTech.backend.user.entity.User;
import com.HungHuyTech.backend.user.repository.RoleRepository;
import com.HungHuyTech.backend.user.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse.UserInfo register(RegisterRequest request) {
        // 1. Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // 2. Lấy role mặc định là CUSTOMER (đã được Flyway seed sẵn trong DB)
        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Default role CUSTOMER not found"));

        // 3. Tạo User mới với mật khẩu đã được mã hóa (BCrypt)
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status("ACTIVE")
                .roles(Set.of(customerRole))
                .build();

        User savedUser = userRepository.save(user);

        return mapToUserInfo(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        // 1. Tìm user theo email hoặc fullName (tên đăng nhập)
        User user = userRepository.findByEmailOrFullName(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Xác thực bằng email thực tế của user và password qua Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        // 3. Sinh JWT Token dựa trên email chính thức của user
        String token = jwtTokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(mapToUserInfo(user))
                .build();
    }

    // PHƯƠNG THỨC ĐĂNG NHẬP DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ADMIN)
    public AuthResponse adminLogin(LoginRequest request) {
        // 1. Tìm user theo email hoặc fullName (tên đăng nhập)
        User user = userRepository.findByEmailOrFullName(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Kiểm tra Role: BẮT BUỘC phải có role ADMIN
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ADMIN"));

        if (!isAdmin) {
            throw new RuntimeException("Truy cập bị từ chối: Tài khoản của bạn không có quyền Quản trị viên!");
        }

        // 3. Xác thực mật khẩu qua Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        // 4. Sinh JWT Token
        String token = jwtTokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(mapToUserInfo(user))
                .build();
    }

    // PHƯƠNG THỨC XỬ LÝ ĐĂNG NHẬP BẰNG GOOGLE OAUTH2
    @Transactional
    public AuthResponse googleLogin(GoogleIdToken.Payload googlePayload) {
        String email = googlePayload.getEmail();
        String name = (String) googlePayload.get("name");

        // 1. Tìm kiếm user theo email, nếu chưa có thì tự động đăng ký mới tài khoản
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            Role customerRole = roleRepository.findByName("CUSTOMER")
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Default role CUSTOMER not found"));

            User newUser = User.builder()
                    .fullName(name != null ? name : email.split("@")[0])
                    .email(email)
                    .phone("") // Google không trả về số điện thoại mặc định
                    .passwordHash(passwordEncoder.encode("GOOGLE_OAUTH_DEFAULT_PASSWORD_" + System.currentTimeMillis()))
                    .status("ACTIVE")
                    .roles(Set.of(customerRole))
                    .build();

            return userRepository.save(newUser);
        });

        // 2. Sinh JWT Token thông qua JwtTokenProvider có sẵn trong hệ thống
        String token = jwtTokenProvider.generateToken(user.getEmail());

        // 3. Trả về cấu trúc AuthResponse chuẩn
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(mapToUserInfo(user))
                .build();
    }

    private AuthResponse.UserInfo mapToUserInfo(User user) {
        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return AuthResponse.UserInfo.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .roles(roleNames)
                .build();
    }
}