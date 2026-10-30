package com.HungHuyTech.backend.banner.controller;

import com.HungHuyTech.backend.banner.entity.Banner;
import com.HungHuyTech.backend.banner.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BannerController {

    private final BannerRepository bannerRepository;

    // Lấy danh sách banner hình ảnh cho phần ƯU ĐÃI NỔI BẬT
    @GetMapping
    public ResponseEntity<List<Banner>> getActiveBanners() {
        // Chỉ lấy banner có type là IMAGE và status là ACTIVE
        List<Banner> banners = bannerRepository.findByTypeAndStatusOrderByIdDesc("IMAGE", "ACTIVE");
        return ResponseEntity.ok(banners);
    }

    // Lấy Banner Video cho phần HERO VIDEO đầu trang
    @GetMapping("/hero-video")
    public ResponseEntity<Banner> getActiveHeroVideo() {
        return bannerRepository.findFirstByTypeAndStatusOrderByIdDesc("VIDEO", "ACTIVE")
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.<Banner>noContent().build());
    }
}