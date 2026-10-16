package com.HungHuyTech.backend.blog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BlogRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    private String slug;
    private String category;
    private String thumbnail;
    private String summary;

    @NotBlank(message = "Nội dung bài viết không được để trống")
    private String content;
    private String status;
}