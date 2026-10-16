package com.HungHuyTech.backend.product.repository;

import com.HungHuyTech.backend.product.entity.AttributeValue;
import com.HungHuyTech.backend.product.entity.Product;
import com.HungHuyTech.backend.product.entity.ProductVariant;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterProducts(
            String keyword,
            Long categoryId,
            Long brandId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            List<Long> attributeValueIds,
            boolean onlyActive
    ) {
        return (root, query, cb) -> {
            query.distinct(true);
            List<Predicate> predicates = new ArrayList<>();

            if (onlyActive) {
                predicates.add(cb.isTrue(root.get("isActive")));
            }

            if (StringUtils.hasText(keyword)) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("sku")), pattern),
                        cb.like(cb.lower(root.get("shortDescription")), pattern)
                ));
            }

            if (categoryId != null) {
                predicates.add(cb.or(
                        cb.equal(root.get("category").get("id"), categoryId),
                        cb.equal(root.get("category").get("parent").get("id"), categoryId)
                ));
            }

            if (brandId != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), brandId));
            }

            if (minPrice != null || maxPrice != null || (attributeValueIds != null && !attributeValueIds.isEmpty())) {
                Join<Product, ProductVariant> variantJoin = root.join("variants", JoinType.INNER);
                if (onlyActive) {
                    predicates.add(cb.isTrue(variantJoin.get("isActive")));
                }
                if (minPrice != null) {
                    predicates.add(cb.greaterThanOrEqualTo(variantJoin.get("price"), minPrice));
                }
                if (maxPrice != null) {
                    predicates.add(cb.lessThanOrEqualTo(variantJoin.get("price"), maxPrice));
                }
                if (attributeValueIds != null && !attributeValueIds.isEmpty()) {
                    Join<ProductVariant, AttributeValue> attrJoin = variantJoin.join("attributeValues", JoinType.INNER);
                    predicates.add(attrJoin.get("id").in(attributeValueIds));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}