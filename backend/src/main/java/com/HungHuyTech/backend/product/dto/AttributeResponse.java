package com.HungHuyTech.backend.product.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AttributeResponse {
    private Long id;
    private String name;
    private List<ValueItem> values;

    @Getter
    @Builder
    public static class ValueItem {
        private Long id;
        private String value;
    }
}