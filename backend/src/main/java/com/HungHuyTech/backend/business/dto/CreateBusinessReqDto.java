package com.HungHuyTech.backend.business.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class CreateBusinessReqDto {
    @NotBlank
    private String companyName;
    @NotBlank
    private String contactName;
    @NotBlank
    private String phone;
    @NotBlank
    private String email;
    @NotBlank
    private String projectType;
    @NotBlank
    private String description;
    private BigDecimal budget;
    private LocalDate expectedDate;
}