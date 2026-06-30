-- Insert Manager User (Password: 123456)
INSERT INTO Users (full_name, email, password_hash, phone, role, status) VALUES
('Cinema Manager', 'manager@cinebook.com', '$2a$12$ye3x31aAjUsR7av6gdvts.C.wpUokdeGmnIrA8JlB1JzwKICNOwOO', '0912345678', 'ScheduleManager', 'Active')
ON DUPLICATE KEY UPDATE email=email;
