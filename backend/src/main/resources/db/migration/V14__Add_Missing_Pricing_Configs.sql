-- Thêm các config key còn thiếu cho tính năng giá động (BR-01)
-- weekend_day_multiplier (V1) không được code đọc; thay bằng weekend_surcharge_percent

INSERT IGNORE INTO SystemConfig (config_key, config_value, config_type, description) VALUES
('base_price',               '75000', 'Integer', 'Giá vé cơ bản (VND) cho ghế Normal, áp dụng toàn hệ thống'),
('weekend_surcharge_percent','20',    'Decimal', 'Phụ thu cuối tuần (Thứ 7, CN) theo phần trăm (%)'),
('evening_surcharge_time',   '17:00', 'String',  'Giờ bắt đầu áp dụng phụ thu buổi tối (HH:mm)'),
('evening_surcharge_percent','10',    'Decimal', 'Phụ thu buổi tối theo phần trăm (%)');
