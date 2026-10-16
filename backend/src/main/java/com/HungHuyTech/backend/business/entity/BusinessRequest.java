package com.HungHuyTech.backend.business.entity;

import com.HungHuyTech.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "business_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_name", length = 200, nullable = false)
    private String companyName;

    @Column(name = "contact_name", length = 150, nullable = false)
    private String contactName;

    @Column(name = "phone", length = 20, nullable = false)
    private String phone;

    @Column(name = "email", length = 150, nullable = false)
    private String email;

    @Column(name = "project_type", length = 100, nullable = false)
    private String projectType;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "budget")
    private BigDecimal budget;

    @Column(name = "expected_date")
    private LocalDate expectedDate;

    @Builder.Default
    @Column(name = "status", length = 30, nullable = false)
    private String status = "PENDING";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}