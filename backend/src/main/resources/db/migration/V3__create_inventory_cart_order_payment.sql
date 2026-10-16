-- ==========================================================
-- 1. MODULE KHO HÀNG & SERIAL (MỤC 16 & 17)
-- ==========================================================
CREATE TABLE warehouses (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(150) NOT NULL,
                            address VARCHAR(255) NOT NULL,
                            phone VARCHAR(20),
                            is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventories (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             warehouse_id BIGINT NOT NULL,
                             variant_id BIGINT NOT NULL,
                             quantity INT NOT NULL DEFAULT 0,
                             reserved_quantity INT NOT NULL DEFAULT 0,
                             available_quantity INT NOT NULL DEFAULT 0,
                             updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                             UNIQUE KEY uk_inventory_warehouse_variant (warehouse_id, variant_id),
                             INDEX idx_inventories_variant (variant_id),
                             CONSTRAINT fk_inventories_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE RESTRICT,
                             CONSTRAINT fk_inventories_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventory_transactions (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        warehouse_id BIGINT NOT NULL,
                                        variant_id BIGINT NOT NULL,
                                        transaction_type VARCHAR(50) NOT NULL, -- IMPORT, SALE, RETURN, ADJUSTMENT, RESERVATION, RELEASE
                                        quantity INT NOT NULL,
                                        reference_type VARCHAR(50),
                                        reference_id BIGINT,
                                        note VARCHAR(255),
                                        created_by BIGINT,
                                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        INDEX idx_inv_tx_variant (variant_id),
                                        CONSTRAINT fk_inv_tx_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE RESTRICT,
                                        CONSTRAINT fk_inv_tx_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_serials (
                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                 variant_id BIGINT NOT NULL,
                                 serial_number VARCHAR(100) NOT NULL UNIQUE,
                                 warehouse_id BIGINT NOT NULL,
                                 status VARCHAR(30) NOT NULL DEFAULT 'IN_STOCK', -- IN_STOCK, RESERVED, SOLD, RETURNED, DEFECTIVE, WARRANTY
                                 imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 sold_at DATETIME NULL,
                                 warranty_start DATE NULL,
                                 warranty_end DATE NULL,
                                 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                 INDEX idx_serials_number (serial_number),
                                 INDEX idx_serials_variant_status (variant_id, status),
                                 CONSTRAINT fk_serials_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE RESTRICT,
                                 CONSTRAINT fk_serials_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 2. MODULE GIỎ HÀNG (MỤC 13)
-- ==========================================================
CREATE TABLE carts (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       user_id BIGINT NOT NULL UNIQUE,
                       created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart_items (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            cart_id BIGINT NOT NULL,
                            variant_id BIGINT NOT NULL,
                            quantity INT NOT NULL CHECK (quantity > 0),
                            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            UNIQUE KEY uk_cart_variant (cart_id, variant_id),
                            CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
                            CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 3. MODULE ĐƠN HÀNG & THANH TOÁN (MỤC 14 & 15)
-- ==========================================================
CREATE TABLE orders (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        order_code VARCHAR(50) NOT NULL UNIQUE,
                        user_id BIGINT NOT NULL,
                        status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, RETURNED
                        payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID', -- UNPAID, PAID, FAILED, REFUNDED
                        shipping_status VARCHAR(30) NOT NULL DEFAULT 'NOT_SHIPPED',
                        recipient_name VARCHAR(150) NOT NULL,
                        recipient_phone VARCHAR(20) NOT NULL,
                        shipping_address VARCHAR(500) NOT NULL,
                        subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                        discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                        shipping_fee DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                        total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                        note TEXT,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_orders_code (order_code),
                        INDEX idx_orders_user (user_id),
                        INDEX idx_orders_status (status),
                        CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             order_id BIGINT NOT NULL,
                             variant_id BIGINT NOT NULL,
                             product_name VARCHAR(255) NOT NULL,
                             variant_name VARCHAR(255) NOT NULL,
                             sku VARCHAR(100) NOT NULL,
                             quantity INT NOT NULL CHECK (quantity > 0),
                             unit_price DECIMAL(15, 2) NOT NULL,
                             discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                             total_amount DECIMAL(15, 2) NOT NULL,
                             INDEX idx_order_items_order (order_id),
                             CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
                             CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          order_id BIGINT NOT NULL,
                          payment_method VARCHAR(50) NOT NULL, -- COD, BANK_TRANSFER, VNPAY
                          transaction_code VARCHAR(100),
                          amount DECIMAL(15, 2) NOT NULL,
                          status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, REFUNDED
                          paid_at DATETIME NULL,
                          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          INDEX idx_payments_order (order_id),
                          CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 4. SEED KHO MẶC ĐỊNH CỦA HÙNG HUY & TỒN KHO BAN ĐẦU
-- ==========================================================
INSERT INTO warehouses (id, name, address, phone, is_active) VALUES
    (1, 'Kho Tổng Hùng Huy - TP. Thủ Đức', '4 Đường Lô C, Khu Phố 3, Phường Tam Bình, TP. Thủ Đức, TP.HCM', '0336868880', TRUE);

-- Tự động nạp sẵn 50 sản phẩm tồn kho cho các biến thể vừa tạo để test Giỏ hàng ngay
INSERT IGNORE INTO inventories (warehouse_id, variant_id, quantity, reserved_quantity, available_quantity)
SELECT 1, pv.id, 50, 0, 50 FROM product_variants pv;