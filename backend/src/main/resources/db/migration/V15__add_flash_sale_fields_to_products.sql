SET @dbname = DATABASE();
SET @tablename = "products";
SET @columnname = "is_flash_sale";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = @dbname AND table_name = @tablename AND column_name = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE products ADD COLUMN is_flash_sale BOOLEAN DEFAULT 0, ADD COLUMN flash_sale_end DATETIME;"
));
PREPARE alterTable FROM @preparedStatement;
EXECUTE alterTable;
DEALLOCATE PREPARE alterTable;