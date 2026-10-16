package com.HungHuyTech.backend.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AttributeRequest {

    @NotBlank(message = "Attribute name is required (e.g., RAM, CPU)")
    private String name;

    @NotEmpty(message = "Attribute values cannot be empty")
    private List<String> values;
}