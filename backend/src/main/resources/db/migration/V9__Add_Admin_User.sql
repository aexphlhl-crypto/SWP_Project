-- Insert Another Admin User (Password: 123456)
INSERT INTO Users (full_name, email, password_hash, phone, role, status) VALUES
('System Admin 2', 'admin2@cinebook.vn', '$2a$12$ye3x31aAjUsR7av6gdvts.C.wpUokdeGmnIrA8JlB1JzwKICNOwOO', '0987654322', 'SystemAdmin', 'Active')
ON DUPLICATE KEY UPDATE email=email;
