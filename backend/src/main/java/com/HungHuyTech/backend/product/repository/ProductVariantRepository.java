package com.HungHuyTech.backend.product.repository;

import com.HungHuyTech.backend.product.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    boolean existsBySku(String sku);

    Optional<ProductVariant> findBySku(String sku);

    // Thêm hàm này để fix lỗi "cannot find symbol method findByProductId"
    List<ProductVariant> findByProductId(Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT variant FROM ProductVariant variant JOIN FETCH variant.product " +
            "WHERE variant.id = :variantId AND variant.product.id = :productId")
    Optional<ProductVariant> findForOrderByIdAndProductId(
            @Param("variantId") Long variantId,
            @Param("productId") Long productId
    );
}