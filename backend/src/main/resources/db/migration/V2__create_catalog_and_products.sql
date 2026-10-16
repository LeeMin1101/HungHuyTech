-- 1. Bảng categories (Hỗ trợ danh mục đa cấp cha - con qua parent_id)
CREATE TABLE categories (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            parent_id BIGINT NULL,
                            name VARCHAR(150) NOT NULL,
                            slug VARCHAR(180) NOT NULL UNIQUE,
                            description TEXT,
                            image_url VARCHAR(500),
                            sort_order INT NOT NULL DEFAULT 0,
                            is_active BOOLEAN NOT NULL DEFAULT TRUE,
                            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            INDEX idx_categories_slug (slug),
                            INDEX idx_categories_parent (parent_id),
                            CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng brands (Thương hiệu sản phẩm)
CREATE TABLE brands (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(150) NOT NULL,
                        slug VARCHAR(180) NOT NULL UNIQUE,
                        logo_url VARCHAR(500),
                        description TEXT,
                        is_active BOOLEAN NOT NULL DEFAULT TRUE,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_brands_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng products (Sản phẩm tổng)
CREATE TABLE products (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          category_id BIGINT NOT NULL,
                          brand_id BIGINT NOT NULL,
                          name VARCHAR(255) NOT NULL,
                          slug VARCHAR(280) NOT NULL UNIQUE,
                          sku VARCHAR(100) NOT NULL UNIQUE,
                          description LONGTEXT,
                          short_description TEXT,
                          warranty_months INT NOT NULL DEFAULT 12,
                          is_featured BOOLEAN NOT NULL DEFAULT FALSE,
                          is_active BOOLEAN NOT NULL DEFAULT TRUE,
                          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          INDEX idx_products_slug (slug),
                          INDEX idx_products_sku (sku),
                          INDEX idx_products_category_brand (category_id, brand_id, is_active),
                          CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
                          CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng product_variants (Biến thể/SKU thực tế)
CREATE TABLE product_variants (
                                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                  product_id BIGINT NOT NULL,
                                  sku VARCHAR(100) NOT NULL UNIQUE,
                                  name VARCHAR(255) NOT NULL,
                                  price DECIMAL(15, 2) NOT NULL,
                                  original_price DECIMAL(15, 2) NULL,
                                  cost_price DECIMAL(15, 2) NULL,
                                  barcode VARCHAR(100),
                                  weight DECIMAL(10, 2) DEFAULT 0.00,
                                  is_active BOOLEAN NOT NULL DEFAULT TRUE,
                                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                  INDEX idx_variants_sku (sku),
                                  INDEX idx_variants_product_price (product_id, is_active, price),
                                  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng product_images (Hình ảnh sản phẩm)
CREATE TABLE product_images (
                                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                product_id BIGINT NOT NULL,
                                variant_id BIGINT NULL,
                                image_url VARCHAR(500) NOT NULL,
                                sort_order INT NOT NULL DEFAULT 0,
                                is_primary BOOLEAN NOT NULL DEFAULT FALSE,
                                INDEX idx_product_images_product (product_id),
                                CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
                                CONSTRAINT fk_images_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Các bảng thuộc tính động EAV (RAM, CPU, GPU...)
CREATE TABLE attributes (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attribute_values (
                                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                  attribute_id BIGINT NOT NULL,
                                  value VARCHAR(150) NOT NULL,
                                  INDEX idx_attr_values_attr (attribute_id),
                                  CONSTRAINT fk_attr_values_attribute FOREIGN KEY (attribute_id) REFERENCES attributes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_variant_attributes (
                                            variant_id BIGINT NOT NULL,
                                            attribute_value_id BIGINT NOT NULL,
                                            PRIMARY KEY (variant_id, attribute_value_id),
                                            INDEX idx_pva_attr_val (attribute_value_id),
                                            CONSTRAINT fk_pva_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE,
                                            CONSTRAINT fk_pva_attr_value FOREIGN KEY (attribute_value_id) REFERENCES attribute_values (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED DỮ LIỆU MẪU & CẤP QUYỀN ADMIN CHO USER ĐẦU TIÊN
-- ==========================================================
-- Cấp thêm quyền ADMIN cho tài khoản đầu tiên (a@gmail.com) để test các API /api/v1/admin/**
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'a@gmail.com' AND r.name = 'ADMIN';

-- Seed Danh mục cha (Cấp 1)
INSERT INTO categories (id, parent_id, name, slug, description, sort_order, is_active) VALUES
                                                                                           (1, NULL, 'Laptop', 'laptop', 'Máy tính xách tay chính hãng', 1, TRUE),
                                                                                           (2, NULL, 'PC - Máy tính bộ', 'pc-may-tinh-bo', 'PC văn phòng, gaming, đồ họa', 2, TRUE),
                                                                                           (3, NULL, 'Linh kiện máy tính', 'linh-kien-may-tinh', 'CPU, RAM, SSD, Mainboard, VGA', 3, TRUE),
                                                                                           (4, NULL, 'Thiết bị mạng', 'thiet-bi-mang', 'Router, Switch, Access Point doanh nghiệp', 4, TRUE);

-- Seed Danh mục con (Cấp 2 - Trỏ parent_id về Laptop và PC)
INSERT INTO categories (parent_id, name, slug, description, sort_order, is_active) VALUES
                                                                                       (1, 'Laptop Văn Phòng', 'laptop-van-phong', 'Laptop mỏng nhẹ cho sinh viên và văn phòng', 1, TRUE),
                                                                                       (1, 'Laptop Gaming', 'laptop-gaming', 'Laptop cấu hình cao chơi game', 2, TRUE),
                                                                                       (2, 'PC Gaming', 'pc-gaming', 'Máy tính bàn chiến game', 1, TRUE);

-- Seed Thương hiệu
INSERT INTO brands (name, slug, description, is_active) VALUES
                                                            ('ASUS', 'asus', 'Thương hiệu laptop và linh kiện ASUS', TRUE),
                                                            ('Dell', 'dell', 'Thương hiệu máy tính Dell bền bỉ', TRUE),
                                                            ('MSI', 'msi', 'Thương hiệu gaming MSI', TRUE),
                                                            ('TP-Link', 'tp-link', 'Thiết bị mạng TP-Link', TRUE);