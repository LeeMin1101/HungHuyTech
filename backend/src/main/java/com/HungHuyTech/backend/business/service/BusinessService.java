package com.HungHuyTech.backend.business.service;

import com.HungHuyTech.backend.business.dto.CreateBusinessReqDto;
import com.HungHuyTech.backend.business.entity.BusinessRequest;
import com.HungHuyTech.backend.business.repository.BusinessReqRepository;
import com.HungHuyTech.backend.common.exception.AppException;
import com.HungHuyTech.backend.common.exception.ErrorCode;
import com.HungHuyTech.backend.user.entity.User;
import com.HungHuyTech.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessReqRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public BusinessRequest createRequest(String email, CreateBusinessReqDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        BusinessRequest req = BusinessRequest.builder()
                .user(user)
                .companyName(dto.getCompanyName())
                .contactName(dto.getContactName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .projectType(dto.getProjectType())
                .description(dto.getDescription())
                .budget(dto.getBudget())
                .expectedDate(dto.getExpectedDate())
                .status("PENDING")
                .build();

        return repository.save(req);
    }

    public List<BusinessRequest> getMyRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return repository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }
}