package com.HungHuyTech.backend.banner.repository;

import com.HungHuyTech.backend.banner.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {

    // (Mới) Lấy toàn bộ danh sách cho trang Admin
    List<Banner> findAllByOrderByIdDesc();

    // Dành cho trang chủ (Lấy danh sách ảnh banner)
    List<Banner> findByTypeAndStatusOrderByIdDesc(String type, String status);

    // Dành cho trang chủ (Lấy video banner)
    Optional<Banner> findFirstByTypeAndStatusOrderByIdDesc(String type, String status);

    // (Cũ) Lấy theo trạng thái
    List<Banner> findByStatusOrderByIdDesc(String status);
}