package com.HungHuyTech.backend.inventory.repository;

import com.HungHuyTech.backend.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByWarehouseIdAndVariantId(Long warehouseId, Long variantId);
    List<Inventory> findByVariantId(Long variantId);

    @Query("SELECT SUM(i.availableQuantity) FROM Inventory i WHERE i.variant.id = :variantId")
    Long sumAvailableQuantityByVariantId(@Param("variantId") Long variantId);

    default int getTotalAvailableQuantityByVariantId(Long variantId) {
        Long total = sumAvailableQuantityByVariantId(variantId);
        return total != null ? total.intValue() : 0;
    }
}