package com.HungHuyTech.backend.business.repository;

import com.HungHuyTech.backend.business.entity.BusinessRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BusinessReqRepository extends JpaRepository<BusinessRequest, Long> {
    List<BusinessRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
}