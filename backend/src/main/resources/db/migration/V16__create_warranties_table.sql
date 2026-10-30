CREATE TABLE warranties (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            ticket_code VARCHAR(50) NOT NULL UNIQUE,
                            customer_name VARCHAR(100) NOT NULL,
                            customer_phone VARCHAR(20) NOT NULL,
                            customer_email VARCHAR(100),
                            product_name VARCHAR(255) NOT NULL,
                            serial_number VARCHAR(100) NOT NULL,
                            issue_description TEXT NOT NULL,
                            technician_note TEXT,
                            status VARCHAR(50) DEFAULT 'PENDING',
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);