CREATE TABLE blogs (
                       id BIGSERIAL PRIMARY KEY,
                       title VARCHAR(255) NOT NULL,
                       slug VARCHAR(255) NOT NULL UNIQUE,
                       category VARCHAR(100),
                       thumbnail VARCHAR(500),
                       summary TEXT,
                       content TEXT NOT NULL,
                       status VARCHAR(20) NOT NULL,
                       created_at TIMESTAMP,
                       updated_at TIMESTAMP
);