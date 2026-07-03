-- V5: Add pending_users table for OTP-based registration flow
-- Users are stored here temporarily until OTP is verified, then moved to Users table.

CREATE TABLE IF NOT EXISTS pending_users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    full_name       VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    date_of_birth   DATE,
    otp_code        VARCHAR(255) NOT NULL,
    otp_expires_at  DATETIME     NOT NULL,
    otp_retry_count INT          NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pending_users_email (email)
);
