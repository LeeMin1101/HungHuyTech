package com.HungHuyTech.backend.inventory.repository;

import com.HungHuyTech.backend.inventory.entity.ProductSerial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductSerialRepository extends JpaRepository<ProductSerial, Long> {
    Optional<ProductSerial> findBySerialNumber(String serialNumber);
    boolean existsBySerialNumber(String serialNumber);
}