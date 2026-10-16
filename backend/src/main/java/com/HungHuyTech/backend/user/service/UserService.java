package com.HungHuyTech.backend.user.service;

import com.HungHuyTech.backend.common.dto.PageResponse;
import com.HungHuyTech.backend.common.exception.AppException;
import com.HungHuyTech.backend.common.exception.ErrorCode;
import com.HungHuyTech.backend.user.dto.*;
import com.HungHuyTech.backend.user.entity.Address;
import com.HungHuyTech.backend.user.entity.Role;
import com.HungHuyTech.backend.user.entity.User;
import com.HungHuyTech.backend.user.repository.AddressRepository;
import com.HungHuyTech.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    // 1. Lấy thông tin cá nhân của user đang đăng nhập
    public UserProfileResponse getMyProfile(String email) {
        User user = getUserByEmail(email);
        return mapToProfileResponse(user);
    }

    // 2. Cập nhật thông tin cá nhân
    @Transactional
    public UserProfileResponse updateMyProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());
        return mapToProfileResponse(userRepository.save(user));
    }

    // 3. Lấy danh sách sổ địa chỉ của tôi
    public List<AddressResponse> getMyAddresses(String email) {
        User user = getUserByEmail(email);
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }

    // 4. Thêm địa chỉ mới
    @Transactional
    public AddressResponse addAddress(String email, AddressRequest request) {
        User user = getUserByEmail(email);
        List<Address> existingAddresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());

        // Nếu là địa chỉ đầu tiên hoặc chọn làm mặc định -> bỏ mặc định các địa chỉ cũ
        boolean makeDefault = existingAddresses.isEmpty() || Boolean.TRUE.equals(request.getIsDefault());
        if (makeDefault) {
            existingAddresses.forEach(addr -> addr.setIsDefault(false));
            addressRepository.saveAll(existingAddresses);
        }

        Address address = Address.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .addressDetail(request.getAddressDetail())
                .isDefault(makeDefault)
                .build();

        return mapToAddressResponse(addressRepository.save(address));
    }

    // 5. Cập nhật địa chỉ
    @Transactional
    public AddressResponse updateAddress(String email, Long addressId, AddressRequest request) {
        User user = getUserByEmail(email);
        Address address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Address not found"));

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            List<Address> allAddresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
            allAddresses.forEach(addr -> addr.setIsDefault(false));
            addressRepository.saveAll(allAddresses);
            address.setIsDefault(true);
        }

        address.setRecipientName(request.getRecipientName());
        address.setPhone(request.getPhone());
        address.setProvince(request.getProvince());
        address.setDistrict(request.getDistrict());
        address.setWard(request.getWard());
        address.setAddressDetail(request.getAddressDetail());

        return mapToAddressResponse(addressRepository.save(address));
    }

    // 6. Xóa địa chỉ
    @Transactional
    public void deleteAddress(String email, Long addressId) {
        User user = getUserByEmail(email);
        Address address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Address not found"));
        addressRepository.delete(address);
    }

    // ==========================================
    // NGHIỆP VỤ DÀNH CHO ADMIN
    // ==========================================
    public PageResponse<UserProfileResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<UserProfileResponse> pageData = userRepository.findAll(pageable)
                .map(this::mapToProfileResponse);
        return PageResponse.from(pageData);
    }

    public UserProfileResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return mapToProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateUserStatus(Long id, UpdateUserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setStatus(request.getStatus());
        return mapToProfileResponse(userRepository.save(user));
    }

    // Helper methods
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AddressResponse mapToAddressResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .recipientName(address.getRecipientName())
                .phone(address.getPhone())
                .province(address.getProvince())
                .district(address.getDistrict())
                .ward(address.getWard())
                .addressDetail(address.getAddressDetail())
                .isDefault(address.getIsDefault())
                .build();
    }
}