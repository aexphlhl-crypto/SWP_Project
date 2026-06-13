-- ============================================================
--  CineBook – Flyway Migration V2 (Seed Data)
-- ============================================================

-- 1. Insert Admin and Customer Users (Password: 123456)
INSERT INTO Users (user_id, full_name, email, password_hash, phone, role, status) VALUES
(1, 'System Admin', 'admin@cinebook.vn', '$2a$12$ye3x31aAjUsR7av6gdvts.C.wpUokdeGmnIrA8JlB1JzwKICNOwOO', '0987654321', 'SystemAdmin', 'Active'),
(2, 'Nguyen Van A', 'customer@gmail.com', '$2a$12$ye3x31aAjUsR7av6gdvts.C.wpUokdeGmnIrA8JlB1JzwKICNOwOO', '0123456789', 'Customer', 'Active')
ON DUPLICATE KEY UPDATE user_id=user_id;


