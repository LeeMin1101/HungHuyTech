package com.HungHuyTech.backend.inventory.service;

import com.HungHuyTech.backend.common.exception.AppException;
import com.HungHuyTech.backend.common.exception.ErrorCode;
import com.HungHuyTech.backend.inventory.dto.CreateSerialRequest;
import com.HungHuyTech.backend.inventory.dto.InventoryAdjustRequest;
import com.HungHuyTech.backend.inventory.dto.InventoryHistoryResponse;
import com.HungHuyTech.backend.inventory.dto.InventoryResponse;
import com.HungHuyTech.backend.inventory.entity.Inventory;
import com.HungHuyTech.backend.inventory.entity.InventoryTransaction;
import com.HungHuyTech.backend.inventory.entity.ProductSerial;
import com.HungHuyTech.backend.inventory.entity.Warehouse;
import com.HungHuyTech.backend.inventory.repository.InventoryRepository;
import com.HungHuyTech.backend.inventory.repository.InventoryTransactionRepository;
import com.HungHuyTech.backend.inventory.repository.ProductSerialRepository;
import com.HungHuyTech.backend.inventory.repository.WarehouseRepository;
import com.HungHuyTech.backend.product.entity.ProductVariant;
import com.HungHuyTech.backend.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final ProductSerialRepository serialRepository;
    private final ProductVariantRepository variantRepository;

    @Transactional(readOnly = true)
    public List<InventoryResponse> getInventoriesByVariant(Long variantId) {
        return inventoryRepository.findByVariantId(variantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 1. Kuhaa ang tibuok listahan sa imbentaryo para sa Admin
    @Transactional(readOnly = true)
    public List<InventoryResponse> getAllInventories() {
        return inventoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 2. Kuhaa ang kasaysayan sa transaksyon sa stock (History)
    @Transactional(readOnly = true)
    public List<InventoryHistoryResponse> getInventoryHistory() {
        return transactionRepository.findAll().stream()
                .map(tx -> InventoryHistoryResponse.builder()
                        .id(tx.getId())
                        .type(tx.getTransactionType())
                        .variantId(tx.getVariant() != null ? tx.getVariant().getId() : null)
                        .sku(tx.getVariant() != null ? tx.getVariant().getSku() : "N/A")
                        .productName(tx.getVariant() != null && tx.getVariant().getProduct() != null ? tx.getVariant().getProduct().getName() : "Sprodukto")
                        .quantity(tx.getQuantity())
                        .note(tx.getNote())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // Nhập kho hoặc điều chỉnh tồn kho (ADMIN/STAFF)
    @Transactional
    public InventoryResponse adjustInventory(InventoryAdjustRequest request) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Warehouse not found"));
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, "Product variant not found"));

        Inventory inventory = inventoryRepository.findByWarehouseIdAndVariantId(warehouse.getId(), variant.getId())
                .orElseGet(() -> Inventory.builder()
                        .warehouse(warehouse)
                        .variant(variant)
                        .quantity(0)
                        .reservedQuantity(0)
                        .availableQuantity(0)
                        .build());

        int newQuantity = inventory.getQuantity() + request.getQuantity();
        int newAvailable = inventory.getAvailableQuantity() + request.getQuantity();

        if (newQuantity < 0 || newAvailable < 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK, "Inventory quantity cannot be negative");
        }

        inventory.setQuantity(newQuantity);
        inventory.setAvailableQuantity(newAvailable);
        Inventory saved = inventoryRepository.save(inventory);

        transactionRepository.save(InventoryTransaction.builder()
                .warehouse(warehouse)
                .variant(variant)
                .transactionType(request.getTransactionType())
                .quantity(request.getQuantity())
                .referenceType("MANUAL")
                .note(request.getNote())
                .build());

        return mapToResponse(saved);
    }

    // Nhập mã Serial cho sản phẩm
    @Transactional
    public String addProductSerial(CreateSerialRequest request) {
        if (serialRepository.existsBySerialNumber(request.getSerialNumber().trim())) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Serial number already exists");
        }
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Warehouse not found"));
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, "Product variant not found"));

        ProductSerial serial = ProductSerial.builder()
                .warehouse(warehouse)
                .variant(variant)
                .serialNumber(request.getSerialNumber().trim())
                .status("IN_STOCK")
                .build();

        serialRepository.save(serial);
        return serial.getSerialNumber();
    }

    // Giữ hàng khi tạo Order (RESERVATION)
    @Transactional
    public void reserveStockForOrder(Long variantId, int requiredQty, Long orderId) {
        List<Inventory> inventories = inventoryRepository.findByVariantId(variantId);
        int remainingToReserve = requiredQty;

        for (Inventory inv : inventories) {
            if (remainingToReserve <= 0) break;
            int avail = inv.getAvailableQuantity();
            if (avail > 0) {
                int take = Math.min(avail, remainingToReserve);
                inv.setAvailableQuantity(avail - take);
                inv.setReservedQuantity(inv.getReservedQuantity() + take);
                inventoryRepository.save(inv);

                transactionRepository.save(InventoryTransaction.builder()
                        .warehouse(inv.getWarehouse())
                        .variant(inv.getVariant())
                        .transactionType("RESERVATION")
                        .quantity(take)
                        .referenceType("ORDER")
                        .referenceId(orderId)
                        .note("Reserved stock for order ID: " + orderId)
                        .build());

                remainingToReserve -= take;
            }
        }

        if (remainingToReserve > 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK, "Insufficient stock for variant ID: " + variantId);
        }
    }

    // Hoàn lại tồn kho khi hủy Order (RELEASE)
    @Transactional
    public void releaseStockForCancelledOrder(Long variantId, int qtyToRelease, Long orderId) {
        List<Inventory> inventories = inventoryRepository.findByVariantId(variantId);
        if (inventories.isEmpty()) return;

        Inventory inv = inventories.get(0);
        inv.setReservedQuantity(Math.max(0, inv.getReservedQuantity() - qtyToRelease));
        inv.setAvailableQuantity(inv.getAvailableQuantity() + qtyToRelease);
        inventoryRepository.save(inv);

        transactionRepository.save(InventoryTransaction.builder()
                .warehouse(inv.getWarehouse())
                .variant(inv.getVariant())
                .transactionType("RELEASE")
                .quantity(qtyToRelease)
                .referenceType("ORDER")
                .referenceId(orderId)
                .note("Released stock from cancelled order ID: " + orderId)
                .build());
    }

    private InventoryResponse mapToResponse(Inventory inv) {
        String primaryImage = "";
        if (inv.getVariant() != null && inv.getVariant().getProduct() != null) {
            primaryImage = inv.getVariant().getProduct().getPrimaryImageUrl();
        }

        return InventoryResponse.builder()
                .id(inv.getId())
                .warehouseId(inv.getWarehouse() != null ? inv.getWarehouse().getId() : null)
                .warehouseName(inv.getWarehouse() != null ? inv.getWarehouse().getName() : "")
                .variantId(inv.getVariant() != null ? inv.getVariant().getId() : null)
                .variantSku(inv.getVariant() != null ? inv.getVariant().getSku() : "")
                .variantName(inv.getVariant() != null ? inv.getVariant().getName() : "Mặc định")
                .productName(inv.getVariant() != null && inv.getVariant().getProduct() != null ? inv.getVariant().getProduct().getName() : "Sản phẩm")
                .imageUrl(primaryImage)
                .productImageUrl(primaryImage)
                .quantity(inv.getQuantity())
                .reservedQuantity(inv.getReservedQuantity())
                .availableQuantity(inv.getAvailableQuantity())
                .minStockAlert(5)
                .updatedAt(inv.getUpdatedAt())
                .build();
    }
}