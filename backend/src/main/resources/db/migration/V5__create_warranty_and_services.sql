-- ==========================================================
-- 1. MODULE BẢO HÀNH (MỤC 20)
-- ==========================================================
CREATE TABLE warranty_policies (
                                   id BIGSERIAL PRIMARY KEY,
                                   name VARCHAR(150) NOT NULL,
                                   description TEXT,
                                   duration_months INT NOT NULL,
                                   terms TEXT,
                                   is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE warranty_registrations (
                                        id BIGSERIAL PRIMARY KEY,
                                        serial_id BIGINT NOT NULL UNIQUE,
                                        order_id BIGINT NOT NULL,
                                        user_id BIGINT NOT NULL,
                                        warranty_code VARCHAR(50) NOT NULL UNIQUE,
                                        start_date DATE NOT NULL,
                                        end_date DATE NOT NULL,
                                        status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
                                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        CONSTRAINT fk_warranty_reg_serial FOREIGN KEY (serial_id) REFERENCES product_serials (id) ON DELETE RESTRICT,
                                        CONSTRAINT fk_warranty_reg_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT,
                                        CONSTRAINT fk_warranty_reg_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX idx_warranty_reg_code ON warranty_registrations (warranty_code);
CREATE INDEX idx_warranty_reg_user ON warranty_registrations (user_id);

CREATE TABLE warranty_requests (
                                   id BIGSERIAL PRIMARY KEY,
                                   warranty_registration_id BIGINT NOT NULL,
                                   user_id BIGINT NOT NULL,
                                   request_code VARCHAR(50) NOT NULL UNIQUE,
                                   problem_description TEXT NOT NULL,
                                   status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
                                   received_at TIMESTAMP NULL,
                                   completed_at TIMESTAMP NULL,
                                   technician_note TEXT,
                                   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   CONSTRAINT fk_warranty_req_registration FOREIGN KEY (warranty_registration_id) REFERENCES warranty_registrations (id) ON DELETE RESTRICT,
                                   CONSTRAINT fk_warranty_req_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX idx_warranty_req_code ON warranty_requests (request_code);
CREATE INDEX idx_warranty_req_user ON warranty_requests (user_id);

-- ==========================================================
-- 2. MODULE DỊCH VỤ CNTT & YÊU CẦU DOANH NGHIỆP (MỤC 21 & 22)
-- ==========================================================
CREATE TABLE service_requests (
                                  id BIGSERIAL PRIMARY KEY,
                                  user_id BIGINT NOT NULL,
                                  service_type VARCHAR(100) NOT NULL,
                                  title VARCHAR(200) NOT NULL,
                                  description TEXT NOT NULL,
                                  contact_name VARCHAR(150) NOT NULL,
                                  phone VARCHAR(20) NOT NULL,
                                  email VARCHAR(150) NOT NULL,
                                  address VARCHAR(500) NOT NULL,
                                  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
                                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  CONSTRAINT fk_service_req_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX idx_service_req_user ON service_requests (user_id);

CREATE TABLE business_requests (
                                   id BIGSERIAL PRIMARY KEY,
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
                                   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   CONSTRAINT fk_business_req_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX idx_business_req_user ON business_requests (user_id);

CREATE TABLE business_request_items (
                                        id BIGSERIAL PRIMARY KEY,
                                        business_request_id BIGINT NOT NULL,
                                        product_id BIGINT NULL,
                                        service_name VARCHAR(200) NULL,
                                        quantity INT NOT NULL,
                                        note VARCHAR(255),
                                        CONSTRAINT fk_business_req_items_req FOREIGN KEY (business_request_id) REFERENCES business_requests (id) ON DELETE CASCADE,
                                        CONSTRAINT fk_business_req_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
);