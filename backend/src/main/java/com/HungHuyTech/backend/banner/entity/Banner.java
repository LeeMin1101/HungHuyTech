package com.HungHuyTech.backend.banner.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(name = "image_url", nullable = false, columnDefinition = "LONGTEXT")
    private String imageUrl;

    @Column(name = "target_link", length = 500)
    private String targetLink;

    @Column(nullable = false, length = 20)
    private String status; // 'ACTIVE' hoặc 'HIDDEN'

    // --- CÁC TRƯỜNG THÊM MỚI CHO TÍNH NĂNG VIDEO HERO ---
    @Column(name = "type", length = 20)
    private String type; // 'IMAGE' hoặc 'VIDEO'

    @Lob
    @Column(name = "video_url", columnDefinition = "LONGTEXT")
    private String videoUrl;

    @Column(name = "highlight", length = 100)
    private String highlight;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    // ----------------------------------------------------

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "ACTIVE";
        }
        if (this.type == null) {
            this.type = "IMAGE"; // Mặc định là IMAGE nếu không truyền
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}