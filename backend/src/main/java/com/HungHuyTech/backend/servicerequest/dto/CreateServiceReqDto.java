package com.HungHuyTech.backend.servicerequest.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateServiceReqDto {
    @NotBlank(message = "Service type is required")
    private String serviceType;
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Description is required")
    private String description;
    @NotBlank(message = "Contact name is required")
    private String contactName;
    @NotBlank(message = "Phone is required")
    private String phone;
    @NotBlank(message = "Email is required")
    private String email;
    @NotBlank(message = "Address is required")
    private String address;
}