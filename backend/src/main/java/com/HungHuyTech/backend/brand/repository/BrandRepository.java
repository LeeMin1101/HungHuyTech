package com.HungHuyTech.backend.brand.repository;

import com.HungHuyTech.backend.brand.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByIsActiveTrueOrderByNameAsc();
    @Query("""
            SELECT b FROM Brand b
            WHERE (:keyword IS NULL OR
                   LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                   LOWER(b.slug) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:isActive IS NULL OR b.isActive = :isActive)
            """)
    Page<Brand> searchAdminBrands(
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);

    @Query(value = "SELECT COUNT(*) FROM products WHERE brand_id = :brandId", nativeQuery = true)
    long countProductsByBrandId(@Param("brandId") Long brandId);
}