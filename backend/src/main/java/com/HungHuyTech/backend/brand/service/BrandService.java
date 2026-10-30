package com.HungHuyTech.backend.brand.service;

import com.HungHuyTech.backend.brand.dto.AdminBrandResponse;
import com.HungHuyTech.backend.brand.dto.BrandRequest;
import com.HungHuyTech.backend.brand.dto.BrandResponse;
import com.HungHuyTech.backend.brand.entity.Brand;
import com.HungHuyTech.backend.brand.repository.BrandRepository;
import com.HungHuyTech.backend.common.dto.PageResponse;
import com.HungHuyTech.backend.common.exception.AppException;
import com.HungHuyTech.backend.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;

    @Transactional(readOnly = true)
    public PageResponse<AdminBrandResponse> getAdminBrands(
            String search,
            Boolean isActive,
            int page,
            int size
    ) {
        String keyword = search == null || search.isBlank() ? null : search.trim();
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name").and(Sort.by("id")));
        return PageResponse.from(brandRepository.searchAdminBrands(keyword, isActive, pageable)
                .map(this::mapToAdminResponse));
    }

    public List<BrandResponse> getAllActiveBrands() {
        return brandRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BrandResponse getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));
        return mapToResponse(brand);
    }

    @Transactional
    public BrandResponse createBrand(BrandRequest request) {
        if (brandRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Brand slug already exists");
        }

        Brand brand = Brand.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .logoUrl(request.getLogoUrl())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return mapToResponse(brandRepository.save(brand));
    }

    @Transactional
    public BrandResponse updateBrand(Long id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));

        if (brandRepository.existsBySlugAndIdNot(request.getSlug(), id)) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Brand slug already exists");
        }

        brand.setName(request.getName());
        brand.setSlug(request.getSlug());
        brand.setLogoUrl(request.getLogoUrl());
        brand.setDescription(request.getDescription());
        if (request.getIsActive() != null) brand.setIsActive(request.getIsActive());

        return mapToResponse(brandRepository.save(brand));
    }

    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));

        if (brandRepository.countProductsByBrandId(id) > 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Cannot delete brand because it has associated products");
        }

        brandRepository.delete(brand);
    }

    private BrandResponse mapToResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .slug(brand.getSlug())
                .logoUrl(brand.getLogoUrl())
                .description(brand.getDescription())
                .isActive(brand.getIsActive())
                .build();
    }

    private AdminBrandResponse mapToAdminResponse(Brand brand) {
        return AdminBrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .slug(brand.getSlug())
                .logoUrl(brand.getLogoUrl())
                .description(brand.getDescription())
                .isActive(brand.getIsActive())
                .productCount(brandRepository.countProductsByBrandId(brand.getId()))
                .build();
    }
}