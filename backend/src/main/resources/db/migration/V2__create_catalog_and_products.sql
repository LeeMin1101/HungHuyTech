-- 1. Bảng categories (Hỗ trợ danh mục đa cấp cha - con qua parent_id)
CREATE TABLE categories (
                            id BIGSERIAL PRIMARY KEY,
                            parent_id BIGINT NULL,
                            name VARCHAR(150) NOT NULL,
                            slug VARCHAR(180) NOT NULL UNIQUE,
                            description TEXT,
                            image_url VARCHAR(500),
                            sort_order INT NOT NULL DEFAULT 0,
                            is_active BOOLEAN NOT NULL DEFAULT TRUE,
                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE RESTRICT
);

CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_parent ON categories (parent_id);

-- 2. Bảng brands (Thương hiệu sản phẩm)
CREATE TABLE brands (
                        id BIGSERIAL PRIMARY KEY,
                        name VARCHAR(150) NOT NULL,
                        slug VARCHAR(180) NOT NULL UNIQUE,
                        logo_url VARCHAR(500),
                        description TEXT,
                        is_active BOOLEAN NOT NULL DEFAULT TRUE,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_slug ON brands (slug);

-- 3. Bảng products (Sản phẩm tổng)
CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,
                          category_id BIGINT NOT NULL,
                          brand_id BIGINT NOT NULL,
                          name VARCHAR(255) NOT NULL,
                          slug VARCHAR(280) NOT NULL UNIQUE,
                          sku VARCHAR(100) NOT NULL UNIQUE,
                          description TEXT,
                          short_description TEXT,
                          warranty_months INT NOT NULL DEFAULT 12,
                          is_featured BOOLEAN NOT NULL DEFAULT FALSE,
                          is_active BOOLEAN NOT NULL DEFAULT TRUE,
                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
                          CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands (id) ON DELETE RESTRICT
);

CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_sku ON products (sku);
CREATE INDEX idx_products_category_brand ON products (category_id, brand_id, is_active);

-- 4. Bảng product_variants (Biến thể/SKU thực tế)
CREATE TABLE product_variants (
                                  id BIGSERIAL PRIMARY KEY,
                                  product_id BIGINT NOT NULL,
                                  sku VARCHAR(100) NOT NULL UNIQUE,
                                  name VARCHAR(255) NOT NULL,
                                  price DECIMAL(15, 2) NOT NULL,
                                  original_price DECIMAL(15, 2) NULL,
                                  cost_price DECIMAL(15, 2) NULL,
                                  barcode VARCHAR(100),
                                  weight DECIMAL(10, 2) DEFAULT 0.00,
                                  is_active BOOLEAN NOT NULL DEFAULT TRUE,
                                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
);

CREATE INDEX idx_variants_sku ON product_variants (sku);
CREATE INDEX idx_variants_product_price ON product_variants (product_id, is_active, price);

-- 5. Bảng product_images (Hình ảnh sản phẩm)
CREATE TABLE product_images (
                                id BIGSERIAL PRIMARY KEY,
                                product_id BIGINT NOT NULL,
                                variant_id BIGINT NULL,
                                image_url VARCHAR(500) NOT NULL,
                                sort_order INT NOT NULL DEFAULT 0,
                                is_primary BOOLEAN NOT NULL DEFAULT FALSE,
                                CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
                                CONSTRAINT fk_images_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE SET NULL
);

CREATE INDEX idx_product_images_product ON product_images (product_id);

-- 6. Các bảng thuộc tính động EAV (RAM, CPU, GPU...)
CREATE TABLE attributes (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE attribute_values (
                                  id BIGSERIAL PRIMARY KEY,
                                  attribute_id BIGINT NOT NULL,
                                  value VARCHAR(150) NOT NULL,
                                  CONSTRAINT fk_attr_values_attribute FOREIGN KEY (attribute_id) REFERENCES attributes (id) ON DELETE CASCADE
);

CREATE INDEX idx_attr_values_attr ON attribute_values (attribute_id);

CREATE TABLE product_variant_attributes (
                                            variant_id BIGINT NOT NULL,
                                            attribute_value_id BIGINT NOT NULL,
                                            PRIMARY KEY (variant_id, attribute_value_id),
                                            CONSTRAINT fk_pva_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE,
                                            CONSTRAINT fk_pva_attr_value FOREIGN KEY (attribute_value_id) REFERENCES attribute_values (id) ON DELETE CASCADE
);

CREATE INDEX idx_pva_attr_val ON product_variant_attributes (attribute_value_id);

-- ==========================================================
-- SEED DỮ LIỆU MẪU & CẤP QUYỀN ADMIN CHO USER ĐẦU TIÊN
-- ==========================================================
-- Cấp thêm quyền ADMIN cho tài khoản đầu tiên (a@gmail.com) để test các API /api/v1/admin/**
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'a@gmail.com' AND r.name = 'ADMIN'
    ON CONFLICT (user_id, role_id) DO NOTHING;

-- Seed Danh mục cha (Cấp 1) - Không chỉ định ID cố định, dùng ON CONFLICT (slug)
INSERT INTO categories (parent_id, name, slug, description, sort_order, is_active) VALUES
                                                                                       (NULL, 'Laptop', 'laptop', 'Máy tính xách tay chính hãng', 1, TRUE),
                                                                                       (NULL, 'PC - Máy tính bộ', 'pc-may-tinh-bo', 'PC văn phòng, gaming, đồ họa', 2, TRUE),
                                                                                       (NULL, 'Linh kiện máy tính', 'linh-kien-may-tinh', 'CPU, RAM, SSD, Mainboard, VGA', 3, TRUE),
                                                                                       (NULL, 'Thiết bị mạng', 'thiet-bi-mang', 'Router, Switch, Access Point doanh nghiệp', 4, TRUE)
    ON CONFLICT (slug) DO NOTHING;

-- Seed Danh mục con (Cấp 2) - Lấy parent_id động bằng subquery dựa vào slug của danh mục cha
INSERT INTO categories (parent_id, name, slug, description, sort_order, is_active) VALUES
                                                                                       ((SELECT id FROM categories WHERE slug = 'laptop'), 'Laptop Văn Phòng', 'laptop-van-phong', 'Laptop mỏng nhẹ cho sinh viên và văn phòng', 1, TRUE),
                                                                                       ((SELECT id FROM categories WHERE slug = 'laptop'), 'Laptop Gaming', 'laptop-gaming', 'Laptop cấu hình cao chơi game', 2, TRUE),
                                                                                       ((SELECT id FROM categories WHERE slug = 'pc-may-tinh-bo'), 'PC Gaming', 'pc-gaming', 'Máy tính bàn chiến game', 1, TRUE)
    ON CONFLICT (slug) DO NOTHING;

-- Seed Thương hiệu
INSERT INTO brands (name, slug, description, is_active) VALUES
                                                            ('ASUS', 'asus', 'Thương hiệu laptop và linh kiện ASUS', TRUE),
                                                            ('Dell', 'dell', 'Thương hiệu máy tính Dell bền bỉ', TRUE),
                                                            ('MSI', 'msi', 'Thương hiệu gaming MSI', TRUE),
                                                            ('TP-Link', 'tp-link', 'Thiết bị mạng TP-Link', TRUE)
    ON CONFLICT (slug) DO NOTHING;