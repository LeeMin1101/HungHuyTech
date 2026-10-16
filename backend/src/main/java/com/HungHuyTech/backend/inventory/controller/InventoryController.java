package com.HungHuyTech.backend.inventory.controller;

import com.HungHuyTech.backend.common.dto.ApiResponse;
import com.HungHuyTech.backend.inventory.dto.CreateSerialRequest;
import com.HungHuyTech.backend.inventory.dto.InventoryAdjustRequest;
import com.HungHuyTech.backend.inventory.dto.InventoryResponse;
import com.HungHuyTech.backend.inventory.dto.InventoryHistoryResponse;
import com.HungHuyTech.backend.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/inventories")
@RequiredArgsConstructor
@Tag(name = "Admin - Inventory & Serials", description = "API Quản lý tồn kho và Serial sản phẩm")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @Operation(summary = "Lấy danh sách toàn bộ tồn kho các SKU")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getAllInventories() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAllInventories()));
    }

    @GetMapping("/history")
    @Operation(summary = "Xem lịch sử nhập xuất kho")
    public ResponseEntity<ApiResponse<List<InventoryHistoryResponse>>> getInventoryHistory() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getInventoryHistory()));
    }

    @GetMapping("/variant/{variantId}")
    @Operation(summary = "Xem tồn kho của một biến thể SKU tại các kho")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getInventoryByVariant(@PathVariable Long variantId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getInventoriesByVariant(variantId)));
    }

    @PostMapping("/adjust")
    @Operation(summary = "Nhập kho (IMPORT) hoặc điều chỉnh tồn kho (ADJUSTMENT)")
    public ResponseEntity<ApiResponse<InventoryResponse>> adjustInventory(
            @Valid @RequestBody InventoryAdjustRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryService.adjustInventory(request),
                "Inventory updated successfully"
        ));
    }

    @PostMapping("/serials")
    @Operation(summary = "Nhập mã Serial Number cho sản phẩm")
    public ResponseEntity<ApiResponse<String>> addProductSerial(
            @Valid @RequestBody CreateSerialRequest request
    ) {
        String serial = inventoryService.addProductSerial(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(serial, "Serial added successfully"));
    }
}