package com.HungHuyTech.backend.servicerequest.service;

import com.HungHuyTech.backend.common.exception.AppException;
import com.HungHuyTech.backend.common.exception.ErrorCode;
import com.HungHuyTech.backend.servicerequest.dto.CreateServiceReqDto;
import com.HungHuyTech.backend.servicerequest.entity.ServiceRequest;
import com.HungHuyTech.backend.servicerequest.repository.ServiceReqRepository;
import com.HungHuyTech.backend.user.entity.User;
import com.HungHuyTech.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceReqService {
    private final ServiceReqRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public ServiceRequest createRequest(String email, CreateServiceReqDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        ServiceRequest req = ServiceRequest.builder()
                .user(user).serviceType(dto.getServiceType()).title(dto.getTitle())
                .description(dto.getDescription()).contactName(dto.getContactName())
                .phone(dto.getPhone()).email(dto.getEmail()).address(dto.getAddress())
                .build();
        return repository.save(req);
    }

    public List<ServiceRequest> getMyRequests(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return repository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }
}