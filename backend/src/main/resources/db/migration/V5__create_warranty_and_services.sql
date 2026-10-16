-- ==========================================================
-- 1. MODULE BẢO HÀNH (MỤC 20)
-- ==========================================================
CREATE TABLE warranty_policies (
                                   id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                   name VARCHAR(150) NOT NULL,
                                   description TEXT,
                                   duration_months INT NOT NULL,
                                   terms TEXT,
                                   is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE warranty_registrations (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        serial_id BIGINT NOT NULL UNIQUE,
                                        order_id BIGINT NOT NULL,
                                        user_id BIGINT NOT NULL,
                                        warranty_code VARCHAR(50) NOT NULL UNIQUE,
                                        start_date DATE NOT NULL,
                                        end_date DATE NOT NULL,
                                        status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
                                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                        INDEX idx_warranty_reg_code (warranty_code),
                                        INDEX idx_warranty_reg_user (user_id),
                                        CONSTRAINT fk_warranty_reg_serial FOREIGN KEY (serial_id) REFERENCES product_serials (id) ON DELETE RESTRICT,
                                        CONSTRAINT fk_warranty_reg_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT,
                                        CONSTRAINT fk_warranty_reg_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE warranty_requests (
                                   id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                   warranty_registration_id BIGINT NOT NULL,
                                   user_id BIGINT NOT NULL,
                                   request_code VARCHAR(50) NOT NULL UNIQUE,
                                   problem_description TEXT NOT NULL,
                                   status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
                                   received_at DATETIME NULL,
                                   completed_at DATETIME NULL,
                                   technician_note TEXT,
                                   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                   INDEX idx_warranty_req_code (request_code),
                                   INDEX idx_warranty_req_user (user_id),
                                   CONSTRAINT fk_warranty_req_registration FOREIGN KEY (warranty_registration_id) REFERENCES warranty_registrations (id) ON DELETE RESTRICT,
                                   CONSTRAINT fk_warranty_req_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 2. MODULE DỊCH VỤ CNTT & YÊU CẦU DOANH NGHIỆP (MỤC 21 & 22)
-- ==========================================================
CREATE TABLE service_requests (
                                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                  user_id BIGINT NOT NULL,
                                  service_type VARCHAR(100) NOT NULL,
                                  title VARCHAR(200) NOT NULL,
                                  description TEXT NOT NULL,
                                  contact_name VARCHAR(150) NOT NULL,
                                  phone VARCHAR(20) NOT NULL,
                                  email VARCHAR(150) NOT NULL,
                                  address VARCHAR(500) NOT NULL,
                                  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
                                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                  INDEX idx_service_req_user (user_id),
                                  CONSTRAINT fk_service_req_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE business_requests (
                                   id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                   user_id BIGINT NOT NULL,
                                   company_name VARCHAR(200) NOT NULL,
                                   contact_name VARCHAR(150) NOT NULL,
                                   phone VARCHAR(20) NOT NULL,
                                   email VARCHAR(150) NOT NULL,
                                   project_type VARCHAR(100) NOT NULL,
                                   description TEXT NOT NULL,
                                   budget DECIMAL(15, 2),
                                   expected_date DATE,
                                   status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
                                   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                   INDEX idx_business_req_user (user_id),
                                   CONSTRAINT fk_business_req_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE business_request_items (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        business_request_id BIGINT NOT NULL,
                                        product_id BIGINT NULL,
                                        service_name VARCHAR(200) NULL,
                                        quantity INT NOT NULL,
                                        note VARCHAR(255),
                                        CONSTRAINT fk_business_req_items_req FOREIGN KEY (business_request_id) REFERENCES business_requests (id) ON DELETE CASCADE,
                                        CONSTRAINT fk_business_req_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;