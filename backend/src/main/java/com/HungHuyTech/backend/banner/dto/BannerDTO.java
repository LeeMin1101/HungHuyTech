package com.HungHuyTech.backend.banner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BannerDTO {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    // Đã bỏ @NotBlank để form không bị lỗi khi Admin gửi lên một Video Banner (chỉ có videoUrl)
    private String imageUrl;

    private String targetLink;

    private String status = "ACTIVE";

    // --- CÁC TRƯỜNG MỚI CHO TÍNH NĂNG VIDEO HERO ---
    private String type;

    private String videoUrl;

    private String highlight;

    private String description;
    // -----------------------------------------------
}