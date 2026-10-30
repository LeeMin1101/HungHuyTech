package com.HungHuyTech.backend.category.repository;

import com.HungHuyTech.backend.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByIsActiveTrueOrderBySortOrderAscIdAsc();
    @Query("""
            SELECT c FROM Category c
            WHERE (:keyword IS NULL OR
                   LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                   LOWER(c.slug) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:isActive IS NULL OR c.isActive = :isActive)
            """)
    Page<Category> searchAdminCategories(
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
    boolean existsByParentId(Long parentId);

    @Query(value = "SELECT COUNT(*) FROM products WHERE category_id = :categoryId", nativeQuery = true)
    long countProductsByCategoryId(@Param("categoryId") Long categoryId);
}