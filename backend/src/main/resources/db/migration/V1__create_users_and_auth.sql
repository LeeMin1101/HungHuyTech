-- 1. Bảng roles (Lưu các quyền trong hệ thống)
CREATE TABLE roles (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tự động thêm sẵn 3 quyền mặc định theo Mục 6 của đặc tả
INSERT INTO roles (name) VALUES ('ADMIN'), ('STAFF'), ('CUSTOMER');

-- 2. Bảng users (Lưu thông tin tài khoản người dùng)
CREATE TABLE users (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       full_name VARCHAR(150) NOT NULL,
                       email VARCHAR(150) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       phone VARCHAR(20) NOT NULL,
                       avatar_url VARCHAR(500),
                       status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
                       created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       INDEX idx_users_email (email),
                       INDEX idx_users_phone (phone),
                       INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng trung gian user_roles (Quan hệ nhiều-nhiều giữa User và Role)
CREATE TABLE user_roles (
                            user_id BIGINT NOT NULL,
                            role_id BIGINT NOT NULL,
                            PRIMARY KEY (user_id, role_id),
                            CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                            CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng addresses (Sổ địa chỉ nhận hàng của User)
CREATE TABLE addresses (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           user_id BIGINT NOT NULL,
                           recipient_name VARCHAR(150) NOT NULL,
                           phone VARCHAR(20) NOT NULL,
                           province VARCHAR(100) NOT NULL,
                           district VARCHAR(100) NOT NULL,
                           ward VARCHAR(100) NOT NULL,
                           address_detail VARCHAR(255) NOT NULL,
                           is_default BOOLEAN NOT NULL DEFAULT FALSE,
                           created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                           INDEX idx_addresses_user_id (user_id),
                           CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;