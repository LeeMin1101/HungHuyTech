package com.HungHuyTech.backend.product.repository;

import com.HungHuyTech.backend.product.entity.Attribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttributeRepository extends JpaRepository<Attribute, Long> {
    Optional<Attribute> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}