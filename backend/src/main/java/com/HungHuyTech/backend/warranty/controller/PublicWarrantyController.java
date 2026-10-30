package com.HungHuyTech.backend.warranty.controller;

import com.HungHuyTech.backend.warranty.entity.Warranty;
import com.HungHuyTech.backend.warranty.repository.WarrantyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/warranty")
public class PublicWarrantyController {

    @Autowired
    private WarrantyRepository warrantyRepository;

    // Tra cứu bảo hành (Dành cho khách hàng)
    @GetMapping("/lookup")
    public ResponseEntity<?> lookupWarranty(@RequestParam(required = false) String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Vui lòng nhập số điện thoại hoặc mã Serial để tra cứu!"
            ));
        }
        List<Warranty> results = warrantyRepository.findByCustomerPhoneContainingOrSerialNumberContaining(keyword.trim(), keyword.trim());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", results
        ));
    }
}