package com.HungHuyTech.backend.warranty.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "warranties")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
public class Warranty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String ticketCode;

    private String customerName;
    private String customerPhone;
    private String customerEmail;

    private String productName;
    private String serialNumber;

    @Column(columnDefinition = "TEXT")
    private String issueDescription;

    @Column(columnDefinition = "TEXT")
    private String technicianNote;

    private String status; // PENDING, PROCESSING, REPAIRED, COMPLETED, REJECTED

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.ticketCode == null) {
            this.ticketCode = "WH" + System.currentTimeMillis();
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
    }
}