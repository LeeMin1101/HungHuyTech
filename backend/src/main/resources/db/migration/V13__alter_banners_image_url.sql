-- Đổi kiểu dữ liệu của cột image_url sang LONGTEXT để lưu chuỗi Base64
ALTER TABLE banners MODIFY COLUMN image_url LONGTEXT NOT NULL;