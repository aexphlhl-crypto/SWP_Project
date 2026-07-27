-- Migration V21: Seed Real Production Data for Cinemas, FnB Products, Promo Codes, and Showtimes

-- 1. Update Cinemas with real branch names, addresses, cities, operating hours, and Google Maps links
UPDATE Cinemas SET 
    name = 'CineBook Bến Thành - Quận 1',
    address = '135 Nguyễn Du, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    city = 'Hồ Chí Minh',
    operating_hours = '08:00 - 23:30',
    phone = '028 3823 4567',
    location_map_url = 'https://maps.google.com/?q=135+Nguyen+Du+District+1+HCM',
    status = 'Active'
WHERE cinema_id = 2001;

UPDATE Cinemas SET 
    name = 'CineBook Thảo Điền - Thủ Đức',
    address = '12 Quốc Hương, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
    city = 'Hồ Chí Minh',
    operating_hours = '08:30 - 23:30',
    phone = '028 3744 5678',
    location_map_url = 'https://maps.google.com/?q=12+Quoc+Huong+Thao+Dien+HCM',
    status = 'Active'
WHERE cinema_id = 2002;

UPDATE Cinemas SET 
    name = 'CineBook Hồ Gươm Plaza - Hà Đông',
    address = '110 Trần Phú, Phường Mộ Lao, Quận Hà Đông, Hà Nội',
    city = 'Hà Nội',
    operating_hours = '08:00 - 23:00',
    phone = '024 3356 7890',
    location_map_url = 'https://maps.google.com/?q=110+Tran+Phu+Ha+Dong+Ha+Noi',
    status = 'Active'
WHERE cinema_id = 2003;

UPDATE Cinemas SET 
    name = 'CineBook Lotte Center - Ba Đình',
    address = '54 Liễu Giai, Phường Cống Vị, Quận Ba Đình, Hà Nội',
    city = 'Hà Nội',
    operating_hours = '08:30 - 23:30',
    phone = '024 3831 9999',
    location_map_url = 'https://maps.google.com/?q=54+Lieu+Giai+Ba+Dinh+Ha+Noi',
    status = 'Active'
WHERE cinema_id = 2004;

UPDATE Cinemas SET 
    name = 'CineBook Đà Nẵng Center - Hải Châu',
    address = '293 Nguyễn Văn Linh, Phường Thạc Gián, Quận Thanh Khê, Đà Nẵng',
    city = 'Đà Nẵng',
    operating_hours = '08:00 - 23:00',
    phone = '0236 365 4321',
    location_map_url = 'https://maps.google.com/?q=293+Nguyen+Van+Linh+Da+Nang',
    status = 'Active'
WHERE cinema_id = 2005;

UPDATE Cinemas SET 
    name = 'CineBook Nha Trang Gold Coast',
    address = '01 Trần Hưng Đạo, Phường Lộc Thọ, TP. Nha Trang, Khánh Hòa',
    city = 'Nha Trang',
    operating_hours = '09:00 - 23:00',
    phone = '0258 352 8888',
    location_map_url = 'https://maps.google.com/?q=01+Tran+Hung+Dao+Nha+Trang',
    status = 'Active'
WHERE cinema_id = 2006;

UPDATE Cinemas SET 
    name = 'CineBook Vincom Cần Thơ',
    address = '209 Đường 30 Tháng 4, Phường Xuân Khánh, Quận Ninh Kiều, Cần Thơ',
    city = 'Cần Thơ',
    operating_hours = '08:30 - 23:00',
    phone = '0292 373 9999',
    location_map_url = 'https://maps.google.com/?q=209+Duong+30+Thang+4+Can+Tho',
    status = 'Active'
WHERE cinema_id = 2007;

UPDATE Cinemas SET 
    name = 'CineBook Royal City - Thanh Xuân',
    address = '72A Nguyễn Trãi, Phường Thượng Đình, Quận Thanh Xuân, Hà Nội',
    city = 'Hà Nội',
    operating_hours = '08:00 - 23:30',
    phone = '024 6664 8888',
    location_map_url = 'https://maps.google.com/?q=72A+Nguyen+Trai+Ha+Noi',
    status = 'Active'
WHERE cinema_id = 2008;

-- Deactivate remaining dummy cinemas
UPDATE Cinemas SET status = 'Inactive' WHERE cinema_id > 2008 AND cinema_id <= 2020;


-- 2. Update FnBProducts (Bắp Nước & Combo)
UPDATE FnBProducts SET name = 'Pepsi Zero Sugar (Size L)', description = 'Nước ngọt Pepsi thanh mát sảng khoái không đường 32oz', category = 'Drink', price = 35000, image_url = 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', status = 'Active' WHERE product_id = 4001;
UPDATE FnBProducts SET name = 'Popcorn Phô Mai Giòn Tan (Size M)', description = 'Bỏng ngô thơm phức phủ bột phô mai béo ngậy', category = 'Popcorn', price = 45000, image_url = 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&q=80', status = 'Active' WHERE product_id = 4002;
UPDATE FnBProducts SET name = 'Combo Solo Tiết Kiệm (1 Bắp L + 1 Pepsi L)', description = 'Combo dành cho 1 người gồm 1 bỏng ngô size L tùy chọn vị và 1 Pepsi size L', category = 'Combo', price = 79000, image_url = 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=500&q=80', status = 'Active' WHERE product_id = 4003;
UPDATE FnBProducts SET name = 'Trà Sữa Oolong Kem Cheese CineBook', description = 'Trà oolong đậm vị kết hợp lớp kem cheese béo ngậy thơm ngon', category = 'Drink', price = 49000, image_url = 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=500&q=80', status = 'Active' WHERE product_id = 4004;
UPDATE FnBProducts SET name = 'Popcorn Caramel Ngọt Ngào (Size L)', description = 'Bỏng ngô nổ giòn tan phủ bơ caramel béo ngọt quyến rũ', category = 'Popcorn', price = 55000, image_url = 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=500&q=80', status = 'Active' WHERE product_id = 4005;
UPDATE FnBProducts SET name = 'Combo Couple Đôi Lứa (1 Bắp L + 2 Pepsi L)', description = 'Combo bán chạy nhất dành cho cặp đôi xem phim trọn vẹn', category = 'Combo', price = 109000, image_url = 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=500&q=80', status = 'Active' WHERE product_id = 4006;
UPDATE FnBProducts SET name = '7Up Chanh Chói Mát Lạnh (Size L)', description = 'Nước giải khát vị chanh sảng khoái đánh tan cơn khát 32oz', category = 'Drink', price = 35000, image_url = 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&q=80', status = 'Active' WHERE product_id = 4007;
UPDATE FnBProducts SET name = 'Combo Gia Đình Family (2 Bắp L + 4 Pepsi L)', description = 'Trọn gói trải nghiệm ăn uống cho nhóm bạn 4 người', category = 'Combo', price = 189000, image_url = 'https://images.unsplash.com/photo-1572177191856-3cde618dee1f?w=500&q=80', status = 'Active' WHERE product_id = 4008;

DELETE FROM FnBOrderItems WHERE product_id IN (SELECT product_id FROM FnBProducts WHERE name LIKE '%Dummy%' OR name LIKE '%dummy%');
DELETE FROM FnBProducts WHERE name LIKE '%Dummy%' OR name LIKE '%dummy%';
UPDATE FnBProducts SET status = 'Inactive' WHERE product_id > 4008 AND product_id <= 4020;


-- 3. Update PromoCodes with attractive real promotions
UPDATE PromoCodes SET code = 'CINEWELCOME', discount_type = 'Percentage', discount_value = 20, max_discount_vnd = 50000, min_order_value = 100000, usage_limit = 500, status = 'Active' WHERE promo_id = 5001;
UPDATE PromoCodes SET code = 'CINECOUPLE', discount_type = 'FixedAmount', discount_value = 30000, max_discount_vnd = 30000, min_order_value = 150000, usage_limit = 300, status = 'Active' WHERE promo_id = 5002;
UPDATE PromoCodes SET code = 'FNBCOMBO10', discount_type = 'Percentage', discount_value = 10, max_discount_vnd = 30000, min_order_value = 70000, usage_limit = 200, status = 'Active' WHERE promo_id = 5003;
UPDATE PromoCodes SET code = 'WEEKEND50K', discount_type = 'FixedAmount', discount_value = 50000, max_discount_vnd = 50000, min_order_value = 250000, usage_limit = 100, status = 'Active' WHERE promo_id = 5004;

UPDATE PromoCodes SET status = 'Inactive' WHERE promo_id > 5004 AND promo_id <= 5020;
DELETE FROM PromoCodes WHERE code LIKE 'DUMMY%' OR code LIKE 'dummy%';


-- 4. Seed structured showtimes for current movies across real cinemas for today & coming days
DELETE FROM Showtimes WHERE showtime_id >= 6001 AND showtime_id <= 6100;

INSERT IGNORE INTO Showtimes (showtime_id, movie_id, cinema_id, room_id, start_time, end_time, price_override, status) VALUES
-- Today showtimes
(6001, 3001, 2001, 1, CONCAT(CURDATE(), ' 14:00:00'), CONCAT(CURDATE(), ' 15:30:00'), 85000, 'Scheduled'),
(6002, 3001, 2001, 1, CONCAT(CURDATE(), ' 18:30:00'), CONCAT(CURDATE(), ' 20:00:00'), 95000, 'Scheduled'),
(6003, 3002, 2001, 2, CONCAT(CURDATE(), ' 15:00:00'), CONCAT(CURDATE(), ' 17:30:00'), 90000, 'Scheduled'),
(6004, 3002, 2001, 2, CONCAT(CURDATE(), ' 19:00:00'), CONCAT(CURDATE(), ' 21:30:00'), 105000, 'Scheduled'),
(6005, 3003, 2001, 3, CONCAT(CURDATE(), ' 20:00:00'), CONCAT(CURDATE(), ' 22:35:00'), 110000, 'Scheduled'),

(6006, 3001, 2002, 4, CONCAT(CURDATE(), ' 13:30:00'), CONCAT(CURDATE(), ' 15:00:00'), 85000, 'Scheduled'),
(6007, 3004, 2002, 4, CONCAT(CURDATE(), ' 16:00:00'), CONCAT(CURDATE(), ' 17:40:00'), 85000, 'Scheduled'),
(6008, 3005, 2002, 5, CONCAT(CURDATE(), ' 18:00:00'), CONCAT(CURDATE(), ' 21:15:00'), 120000, 'Scheduled'),

(6009, 3002, 2003, 7, CONCAT(CURDATE(), ' 14:30:00'), CONCAT(CURDATE(), ' 17:00:00'), 90000, 'Scheduled'),
(6010, 3003, 2003, 8, CONCAT(CURDATE(), ' 19:30:00'), CONCAT(CURDATE(), ' 22:05:00'), 100000, 'Scheduled'),

-- Tomorrow showtimes
(6011, 3001, 2001, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 14:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 15:30:00'), 85000, 'Scheduled'),
(6012, 3002, 2001, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 19:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 21:30:00'), 105000, 'Scheduled'),
(6013, 3004, 2002, 4, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 17:40:00'), 85000, 'Scheduled'),
(6014, 3005, 2002, 5, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 18:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 21:15:00'), 120000, 'Scheduled'),
(6015, 3003, 2003, 8, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 19:30:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 22:05:00'), 100000, 'Scheduled');
