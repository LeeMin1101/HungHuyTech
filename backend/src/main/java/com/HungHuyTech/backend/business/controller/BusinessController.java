package com.HungHuyTech.backend.business.controller;

import com.HungHuyTech.backend.business.dto.CreateBusinessReqDto;
import com.HungHuyTech.backend.business.entity.BusinessRequest;
import com.HungHuyTech.backend.business.service.BusinessService;
import com.HungHuyTech.backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/business/requests")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService service;

    @PostMapping
    public ResponseEntity<ApiResponse<BusinessRequest>> createRequest(Authentication auth, @Valid @RequestBody CreateBusinessReqDto dto) {
        return ResponseEntity.ok(ApiResponse.success(service.createRequest(auth.getName(), dto), "B2B Request submitted"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BusinessRequest>>> getMyRequests(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(service.getMyRequests(auth.getName())));
    }
}