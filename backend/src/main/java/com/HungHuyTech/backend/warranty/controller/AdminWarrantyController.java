package com.HungHuyTech.backend.warranty.controller;

import com.HungHuyTech.backend.warranty.entity.Warranty;
import com.HungHuyTech.backend.warranty.repository.WarrantyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/warranties")
public class AdminWarrantyController {

    @Autowired
    private WarrantyRepository warrantyRepository;

    // 1. Lấy toàn bộ danh sách bảo hành
    @GetMapping
    public ResponseEntity<?> getAllWarranties() {
        List<Warranty> list = warrantyRepository.findAll();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", list
        ));
    }

    // 2. Tạo mới yêu cầu bảo hành từ phía Admin
    @PostMapping
    public ResponseEntity<?> createWarranty(@RequestBody Warranty request) {
        try {
            Warranty saved = warrantyRepository.save(request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Tạo yêu cầu bảo hành thành công!",
                    "data", saved
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Lỗi khi tạo phiếu: " + e.getMessage()
            ));
        }
    }

    // 3. Cập nhật trạng thái và ghi chú kỹ thuật viên
    @PutMapping("/{id}")
    public ResponseEntity<?> updateWarranty(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return warrantyRepository.findById(id).map(ticket -> {
            if (payload.containsKey("status")) {
                ticket.setStatus((String) payload.get("status"));
            }
            if (payload.containsKey("technicianNote")) {
                ticket.setTechnicianNote((String) payload.get("technicianNote"));
            }
            Warranty updated = warrantyRepository.save(ticket);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Cập nhật phiếu thành công!",
                    "data", updated
            ));
        }).orElse(ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Không tìm thấy phiếu bảo hành!"
        )));
    }
}