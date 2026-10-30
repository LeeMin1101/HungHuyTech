package com.HungHuyTech.backend.banner.controller;

import com.HungHuyTech.backend.banner.dto.BannerDTO;
import com.HungHuyTech.backend.banner.entity.Banner;
import com.HungHuyTech.backend.banner.repository.BannerRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/banners")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminBannerController {

    private final BannerRepository bannerRepository;

    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerRepository.findAllByOrderByIdDesc());
    }

    @PostMapping
    public ResponseEntity<Banner> createBanner(@Valid @RequestBody BannerDTO dto) {
        String type = normalizeType(dto.getType());
        String mediaUrl = resolveMediaUrl(dto, type, null);
        Banner banner = Banner.builder()
                .title(dto.getTitle())
                .imageUrl(mediaUrl)
                .targetLink(dto.getTargetLink())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .type(type)
                .videoUrl("VIDEO".equals(type) ? mediaUrl : null)
                .highlight(dto.getHighlight())
                .description(dto.getDescription())
                .build();

        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banner> updateBanner(@PathVariable Long id, @Valid @RequestBody BannerDTO dto) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Banner với ID: " + id));

        String type = normalizeType(dto.getType() != null ? dto.getType() : banner.getType());
        String mediaUrl = resolveMediaUrl(dto, type, banner);
        banner.setTitle(dto.getTitle());
        banner.setImageUrl(mediaUrl);
        banner.setTargetLink(dto.getTargetLink());
        banner.setType(type);
        banner.setVideoUrl("VIDEO".equals(type) ? mediaUrl : null);

        if (dto.getStatus() != null) {
            banner.setStatus(dto.getStatus());
        }

        banner.setHighlight(dto.getHighlight());
        banner.setDescription(dto.getDescription());

        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Banner> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Banner với ID: " + id));

        String newStatus = body.getOrDefault("status", "ACTIVE");
        banner.setStatus(newStatus);

        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBanner(@PathVariable Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Banner với ID: " + id));

        bannerRepository.delete(banner);
        return ResponseEntity.ok(Map.of("message", "Xóa banner thành công!"));
    }

    private String normalizeType(String type) {
        String normalizedType = type == null || type.isBlank()
                ? "IMAGE"
                : type.trim().toUpperCase(Locale.ROOT);
        if (!"IMAGE".equals(normalizedType) && !"VIDEO".equals(normalizedType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại banner không hợp lệ");
        }
        return normalizedType;
    }

    private String resolveMediaUrl(BannerDTO dto, String type, Banner existingBanner) {
        String mediaUrl;
        if ("VIDEO".equals(type)) {
            mediaUrl = firstNonBlank(
                    dto.getVideoUrl(),
                    dto.getImageUrl(),
                    existingBanner == null ? null : existingBanner.getVideoUrl(),
                    existingBanner == null ? null : existingBanner.getImageUrl()
            );
        } else {
            mediaUrl = firstNonBlank(
                    dto.getImageUrl(),
                    existingBanner == null ? null : existingBanner.getImageUrl()
            );
        }

        if (mediaUrl == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đường dẫn ảnh hoặc video không được để trống");
        }
        return mediaUrl;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}