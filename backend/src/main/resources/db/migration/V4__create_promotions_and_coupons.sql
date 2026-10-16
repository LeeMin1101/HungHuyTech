-- 1. Bảng promotions (Chương trình khuyến mãi)
CREATE TABLE promotions (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(150) NOT NULL,
                            description TEXT,
                            discount_type VARCHAR(30) NOT NULL, -- PERCENTAGE, FIXED_AMOUNT
                            discount_value DECIMAL(15, 2) NOT NULL CHECK (discount_value > 0),
                            start_date DATETIME NOT NULL,
                            end_date DATETIME NOT NULL,
                            min_order_value DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                            max_discount DECIMAL(15, 2) NULL,
                            is_active BOOLEAN NOT NULL DEFAULT TRUE,
                            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            INDEX idx_promotions_dates (start_date, end_date),
                            INDEX idx_promotions_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng trung gian áp dụng Promotion cho từng sản phẩm cụ thể (Tùy chọn)
CREATE TABLE promotion_products (
                                    promotion_id BIGINT NOT NULL,
                                    product_id BIGINT NOT NULL,
                                    PRIMARY KEY (promotion_id, product_id),
                                    CONSTRAINT fk_promo_prod_promotion FOREIGN KEY (promotion_id) REFERENCES promotions (id) ON DELETE CASCADE,
                                    CONSTRAINT fk_promo_prod_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng coupons (Mã giảm giá phát hành cho khách hàng)
CREATE TABLE coupons (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         code VARCHAR(50) NOT NULL UNIQUE,
                         promotion_id BIGINT NOT NULL,
                         usage_limit INT NULL, -- NULL nghĩa là không giới hạn số lượt
                         used_count INT NOT NULL DEFAULT 0,
                         start_date DATETIME NOT NULL,
                         end_date DATETIME NOT NULL,
                         is_active BOOLEAN NOT NULL DEFAULT TRUE,
                         created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         INDEX idx_coupons_code (code),
                         CONSTRAINT fk_coupons_promotion FOREIGN KEY (promotion_id) REFERENCES promotions (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED DỮ LIỆU CHƯƠNG TRÌNH KHUYẾN MÃI MẪU
-- ==========================================================
INSERT INTO promotions (id, name, description, discount_type, discount_value, start_date, end_date, min_order_value, max_discount, is_active)
VALUES
    (1, 'Siêu Sale Thu Đông', 'Giảm 10% tối đa 1 triệu cho đơn từ 10 triệu', 'PERCENTAGE', 10.00, '2025-01-01 00:00:00', '2028-12-31 23:59:59', 10000000.00, 1000000.00, TRUE),
    (2, 'Voucher Bạn Mới', 'Giảm trực tiếp 500k cho đơn từ 5 triệu', 'FIXED_AMOUNT', 500000.00, '2025-01-01 00:00:00', '2028-12-31 23:59:59', 5000000.00, NULL, TRUE);

INSERT INTO coupons (code, promotion_id, usage_limit, used_count, start_date, end_date, is_active)
VALUES
    ('SALE10', 1, 100, 0, '2025-01-01 00:00:00', '2028-12-31 23:59:59', TRUE),
    ('NEW500', 2, 50, 0, '2025-01-01 00:00:00', '2028-12-31 23:59:59', TRUE);