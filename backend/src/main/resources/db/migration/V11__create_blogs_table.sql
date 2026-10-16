CREATE TABLE blogs (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       title VARCHAR(255) NOT NULL,
                       slug VARCHAR(255) NOT NULL UNIQUE,
                       category VARCHAR(100),
                       thumbnail VARCHAR(500),
                       summary TEXT,
                       content LONGTEXT NOT NULL,
                       status VARCHAR(20) NOT NULL,
                       created_at DATETIME(6),
                       updated_at DATETIME(6)
);