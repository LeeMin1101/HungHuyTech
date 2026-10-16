package com.HungHuyTech.backend.auth.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Set;

@Getter
@Builder
public class AuthResponse {
    private String accessToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private UserInfo user;

    @Getter
    @Builder
    public static class UserInfo {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private Set<String> roles;
    }
}