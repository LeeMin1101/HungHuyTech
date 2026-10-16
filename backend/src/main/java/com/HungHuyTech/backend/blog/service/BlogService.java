package com.HungHuyTech.backend.blog.service;

import com.HungHuyTech.backend.blog.dto.BlogRequest;
import com.HungHuyTech.backend.blog.dto.BlogResponse;
import com.HungHuyTech.backend.blog.entity.Blog;
import com.HungHuyTech.backend.blog.repository.BlogRepository;
import com.HungHuyTech.backend.common.exception.AppException;
import com.HungHuyTech.backend.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BlogService {
    private final BlogRepository blogRepository;

    @Transactional(readOnly = true)
    public List<BlogResponse> getAllBlogs() {
        return blogRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BlogResponse createBlog(BlogRequest request) {
        if (blogRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Đường dẫn (Slug) này đã tồn tại");
        }

        Blog blog = Blog.builder()
                .title(request.getTitle())
                .slug(request.getSlug())
                .category(request.getCategory())
                .thumbnail(request.getThumbnail())
                .summary(request.getSummary())
                .content(request.getContent())
                .status(request.getStatus() != null ? request.getStatus() : "DRAFT")
                .build();

        return mapToResponse(blogRepository.save(blog));
    }

    @Transactional
    public BlogResponse updateBlog(Long id, BlogRequest request) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài viết"));

        // Kiểm tra xem user có đổi slug sang một slug đã tồn tại hay không
        if (!blog.getSlug().equals(request.getSlug()) && blogRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Đường dẫn (Slug) này đã tồn tại");
        }

        blog.setTitle(request.getTitle());
        blog.setSlug(request.getSlug());
        blog.setCategory(request.getCategory());
        blog.setThumbnail(request.getThumbnail());
        blog.setSummary(request.getSummary());
        blog.setContent(request.getContent());
        blog.setStatus(request.getStatus());

        return mapToResponse(blogRepository.save(blog));
    }

    @Transactional
    public void updateBlogStatus(Long id, String status) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bài viết"));
        blog.setStatus(status);
        blogRepository.save(blog);
    }

    private BlogResponse mapToResponse(Blog blog) {
        return BlogResponse.builder()
                .id(blog.getId())
                .title(blog.getTitle())
                .slug(blog.getSlug())
                .category(blog.getCategory())
                .thumbnail(blog.getThumbnail())
                .summary(blog.getSummary())
                .content(blog.getContent())
                .status(blog.getStatus())
                .createdAt(blog.getCreatedAt())
                .updatedAt(blog.getUpdatedAt())
                .build();
    }
}