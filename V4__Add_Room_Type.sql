-- V4: Add room_type column to Rooms table
-- Using stored procedure to add column only if it doesn't already exist (idempotent)

SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Rooms'
      AND COLUMN_NAME  = 'room_type'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE Rooms ADD COLUMN room_type VARCHAR(20) NOT NULL DEFAULT ''2D''',
    'SELECT ''Column room_type already exists, skipping.'''
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
