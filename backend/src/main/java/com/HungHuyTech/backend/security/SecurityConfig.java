package com.HungHuyTech.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Kích hoạt CORS mặc định để nó nhận cấu hình từ CorsConfig toàn cục
                .cors(org.springframework.security.config.Customizer.withDefaults())

                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 2. Bắt lỗi trả về JSON cho ReactJS xử lý (Thay vì lỗi trắng trang)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"success\": false, \"message\": \"Phiên đăng nhập hết hạn hoặc không hợp lệ\", \"errorCode\": \"UNAUTHORIZED\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"success\": false, \"message\": \"Bạn không có quyền truy cập tính năng này\", \"errorCode\": \"FORBIDDEN\"}");
                        })
                )

                .authorizeHttpRequests(auth -> auth
                        // 1. Mở public cho Auth và Swagger UI
                        .requestMatchers(
                                "/api/v1/auth/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // 2. Mở public cho các API xem sản phẩm, danh mục, tra cứu, banner, blog...
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/categories/**",
                                "/api/v1/brands/**",
                                "/api/v1/products/**",
                                "/api/v1/promotions/**",
                                "/api/v1/warranty/check",
                                "/api/v1/banners",
                                "/api/v1/banners/**",
                                "/api/v1/blogs",
                                "/api/v1/blogs/**",
                                "/api/v1/blog/**",
                                "/api/v1/locations/**"
                        ).permitAll()

                        // 3. Các API quản trị chỉ dành cho ADMIN hoặc STAFF
                        .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "STAFF")

                        // 4. Tất cả API còn lại bắt buộc phải đăng nhập
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}