package com.HungHuyTech.backend.servicerequest.controller;

import com.HungHuyTech.backend.common.dto.ApiResponse;
import com.HungHuyTech.backend.servicerequest.dto.CreateServiceReqDto;
import com.HungHuyTech.backend.servicerequest.entity.ServiceRequest;
import com.HungHuyTech.backend.servicerequest.service.ServiceReqService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/services/requests")
@RequiredArgsConstructor
public class ServiceReqController {
    private final ServiceReqService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceRequest>> createRequest(Authentication auth, @Valid @RequestBody CreateServiceReqDto dto) {
        return ResponseEntity.ok(ApiResponse.success(service.createRequest(auth.getName(), dto), "Request submitted"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ServiceRequest>>> getMyRequests(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(service.getMyRequests(auth.getName())));
    }
}