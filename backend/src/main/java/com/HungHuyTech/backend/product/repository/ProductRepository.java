package com.HungHuyTech.backend.product.repository;

import com.HungHuyTech.backend.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsBySlug(String slug);
    boolean existsBySku(String sku);
    boolean existsBySlugAndIdNot(String slug, Long id);
    boolean existsBySkuAndIdNot(String sku, Long id);
    Optional<Product> findBySlugAndIsActiveTrue(String slug);

    @Query(value = """
            SELECT COUNT(*) FROM order_items oi
            JOIN product_variants pv ON oi.variant_id = pv.id
            WHERE pv.product_id = :productId
            """, nativeQuery = true)
    long countOrdersByProductId(@Param("productId") Long productId);
}