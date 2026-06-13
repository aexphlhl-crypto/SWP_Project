-- Add cinema assignment for cinema/schedule manager accounts.
-- This is intentionally idempotent because some local databases may have
-- received the column manually while diagnosing the login issue.
SET @column_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Users'
      AND COLUMN_NAME = 'cinema_id'
);

SET @add_column_sql := IF(
    @column_exists = 0,
    'ALTER TABLE Users ADD COLUMN cinema_id BIGINT UNSIGNED NULL AFTER deleted_at',
    'SELECT 1'
);
PREPARE add_column_stmt FROM @add_column_sql;
EXECUTE add_column_stmt;
DEALLOCATE PREPARE add_column_stmt;

SET @index_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Users'
      AND INDEX_NAME = 'idx_users_cinema'
);

SET @add_index_sql := IF(
    @index_exists = 0,
    'ALTER TABLE Users ADD INDEX idx_users_cinema (cinema_id)',
    'SELECT 1'
);
PREPARE add_index_stmt FROM @add_index_sql;
EXECUTE add_index_stmt;
DEALLOCATE PREPARE add_index_stmt;

SET @fk_exists := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Users'
      AND CONSTRAINT_NAME = 'fk_users_cinema'
);

SET @add_fk_sql := IF(
    @fk_exists = 0,
    'ALTER TABLE Users ADD CONSTRAINT fk_users_cinema FOREIGN KEY (cinema_id) REFERENCES Cinemas(cinema_id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE add_fk_stmt FROM @add_fk_sql;
EXECUTE add_fk_stmt;
DEALLOCATE PREPARE add_fk_stmt;
