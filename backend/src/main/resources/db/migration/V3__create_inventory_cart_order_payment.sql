-- ==========================================================
-- 1. MODULE KHO HÀNG & SERIAL (MỤC 16 & 17)
-- ==========================================================
CREATE TABLE warehouses (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(150) NOT NULL,
                            address VARCHAR(255) NOT NULL,
                            phone VARCHAR(20),
                            is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE inventories (
                             id BIGSERIAL PRIMARY KEY,
                             warehouse_id BIGINT NOT NULL,
                             variant_id BIGINT NOT NULL,
                             quantity INT NOT NULL DEFAULT 0,
                             reserved_quantity INT NOT NULL DEFAULT 0,
                             available_quantity INT NOT NULL DEFAULT 0,
                             updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             CONSTRAINT uk_inventory_warehouse_variant UNIQUE (warehouse_id, variant_id),
                             CONSTRAINT fk_inventories_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE RESTRICT,
                             CONSTRAINT fk_inventories_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE RESTRICT
);

CREATE INDEX idx_inventories_variant ON inventories (variant_id);

CREATE TABLE inventory_transactions (
                                        id BIGSERIAL PRIMARY KEY,
                                        warehouse_id BIGINT NOT NULL,
                                        variant_id BIGINT NOT NULL,
                                        transaction_type VARCHAR(50) NOT NULL, -- IMPORT, SALE, RETURN, ADJUSTMENT, RESERVATION, RELEASE
                                        quantity INT NOT NULL,
                                        reference_type VARCHAR(50),
                                        reference_id BIGINT,
                                        note VARCHAR(255),
                                        created_by BIGINT,
                                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        CONSTRAINT fk_inv_tx_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE RESTRICT,
                                        CONSTRAINT fk_inv_tx_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE RESTRICT
);

CREATE INDEX idx_inv_tx_variant ON inventory_transactions (variant_id);

CREATE TABLE product_serials (
                                 id BIGSERIAL PRIMARY KEY,
                                 variant_id BIGINT NOT NULL,
                                 serial_number VARCHAR(100) NOT NULL UNIQUE,
                                 warehouse_id BIGINT NOT NULL,
                                 status VARCHAR(30) NOT NULL DEFAULT 'IN_STOCK', -- IN_STOCK, RESERVED, SOLD, RETURNED, DEFECTIVE, WARRANTY
                                 imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 sold_at TIMESTAMP NULL,
                                 warranty_start DATE NULL,
                                 warranty_end DATE NULL,
                                 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 CONSTRAINT fk_serials_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE RESTRICT,
                                 CONSTRAINT fk_serials_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE RESTRICT
);

CREATE INDEX idx_serials_number ON product_serials (serial_number);
CREATE INDEX idx_serials_variant_status ON product_serials (variant_id, status);

-- ==========================================================
-- 2. MODULE GIỎ HÀNG (MỤC 13)
-- ==========================================================
CREATE TABLE carts (
                       id BIGSERIAL PRIMARY KEY,
                       user_id BIGINT NOT NULL UNIQUE,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
                            id BIGSERIAL PRIMARY KEY,
                            cart_id BIGINT NOT NULL,
                            variant_id BIGINT NOT NULL,
                            quantity INT NOT NULL CHECK (quantity > 0),
                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT uk_cart_variant UNIQUE (cart_id, variant_id),
                            CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
                            CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
);

-- ==========================================================
-- 3. MODULE ĐƠN HÀNG & THANH TOÁN (MỤC 14 & 15)
-- ==========================================================
CREATE TABLE orders (
                        id BIGSERIAL PRIMARY KEY,
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
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX idx_orders_code ON orders (order_code);
CREATE INDEX idx_orders_user ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status);

CREATE TABLE order_items (
                             id BIGSERIAL PRIMARY KEY,
                             order_id BIGINT NOT NULL,
                             variant_id BIGINT NOT NULL,
                             product_name VARCHAR(255) NOT NULL,
                             variant_name VARCHAR(255) NOT NULL,
                             sku VARCHAR(100) NOT NULL,
                             quantity INT NOT NULL CHECK (quantity > 0),
                             unit_price DECIMAL(15, 2) NOT NULL,
                             discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                             total_amount DECIMAL(15, 2) NOT NULL,
                             CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
                             CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE RESTRICT
);

CREATE INDEX idx_order_items_order ON order_items (order_id);

CREATE TABLE payments (
                          id BIGSERIAL PRIMARY KEY,
                          order_id BIGINT NOT NULL,
                          payment_method VARCHAR(50) NOT NULL, -- COD, BANK_TRANSFER, VNPAY
                          transaction_code VARCHAR(100),
                          amount DECIMAL(15, 2) NOT NULL,
                          status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, REFUNDED
                          paid_at TIMESTAMP NULL,
                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_order ON payments (order_id);

-- ==========================================================
-- 4. SEED KHO MẶC ĐỊNH CỦA HÙNG HUY & TỒN KHO BAN ĐẦU
-- ==========================================================
INSERT INTO warehouses (id, name, address, phone, is_active) VALUES
    (1, 'Kho Tổng Hùng Huy - TP. Thủ Đức', '4 Đường Lô C, Khu Phố 3, Phường Tam Bình, TP. Thủ Đức, TP.HCM', '0336868880', TRUE)
    ON CONFLICT (id) DO NOTHING;

-- Tự động nạp sẵn 50 sản phẩm tồn kho cho các biến thể vừa tạo để test Giỏ hàng ngay
INSERT INTO inventories (warehouse_id, variant_id, quantity, reserved_quantity, available_quantity)
SELECT 1, pv.id, 50, 0, 50 FROM product_variants pv
    ON CONFLICT (warehouse_id, variant_id) DO NOTHING;