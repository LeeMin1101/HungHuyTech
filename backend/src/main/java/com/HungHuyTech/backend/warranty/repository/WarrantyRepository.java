package com.HungHuyTech.backend.warranty.repository;

import com.HungHuyTech.backend.warranty.entity.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, Long> {
    // Hỗ trợ tra cứu theo số điện thoại hoặc mã serial
    List<Warranty> findByCustomerPhoneContainingOrSerialNumberContaining(String phone, String serial);
}