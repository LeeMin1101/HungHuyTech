package com.HungHuyTech.backend.brand.repository;

import com.HungHuyTech.backend.brand.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByIsActiveTrueOrderByNameAsc();
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);

    @Query(value = "SELECT COUNT(*) FROM products WHERE brand_id = :brandId", nativeQuery = true)
    long countProductsByBrandId(@Param("brandId") Long brandId);
}