-- Migration: Insert Dummy Data

-- Users
INSERT IGNORE INTO Users (user_id, full_name, email, password_hash, phone, role, status) VALUES
(1001, 'Super Admin', 'superadmin@cinebook.com', '$2a$12$ye3x31aAjUsR7av6gdvts.C.wpUokdeGmnIrA8JlB1JzwKICNOwOO', '0999999999', 'SystemAdmin', 'Active'),
(1002, 'Test User 1', 'user1@cinebook.com', '$2a$12$ye3x31aAjUsR7av6gdvts.C.wpUokdeGmnIrA8JlB1JzwKICNOwOO', '0888888888', 'Customer', 'Active'),
(1003, 'Test User 2', 'user2@cinebook.com', '$2a$12$ye3x31aAjUsR7av6gdvts.C.wpUokdeGmnIrA8JlB1JzwKICNOwOO', '0777777777', 'Customer', 'Active');

-- Cinemas
INSERT IGNORE INTO Cinemas (cinema_id, name, address, city, latitude, longitude, phone, operating_hours, status) VALUES
(2001, 'CineBook Cinema 1', '100 Main St, District 1', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456701', '08:00 - 23:00', 'Active'),
(2002, 'CineBook Cinema 2', '200 Main St, District 2', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456702', '08:00 - 23:00', 'Active'),
(2003, 'CineBook Cinema 3', '300 Main St, District 3', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456703', '08:00 - 23:00', 'Active'),
(2004, 'CineBook Cinema 4', '400 Main St, District 4', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456704', '08:00 - 23:00', 'Active'),
(2005, 'CineBook Cinema 5', '500 Main St, District 5', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456705', '08:00 - 23:00', 'Active'),
(2006, 'CineBook Cinema 6', '600 Main St, District 6', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456706', '08:00 - 23:00', 'Active'),
(2007, 'CineBook Cinema 7', '700 Main St, District 7', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456707', '08:00 - 23:00', 'Active'),
(2008, 'CineBook Cinema 8', '800 Main St, District 8', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456708', '08:00 - 23:00', 'Active'),
(2009, 'CineBook Cinema 9', '900 Main St, District 9', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456709', '08:00 - 23:00', 'Active'),
(2010, 'CineBook Cinema 10', '1000 Main St, District 10', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456710', '08:00 - 23:00', 'Active'),
(2011, 'CineBook Cinema 11', '1100 Main St, District 11', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456711', '08:00 - 23:00', 'Active'),
(2012, 'CineBook Cinema 12', '1200 Main St, District 12', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456712', '08:00 - 23:00', 'Active'),
(2013, 'CineBook Cinema 13', '1300 Main St, District 13', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456713', '08:00 - 23:00', 'Active'),
(2014, 'CineBook Cinema 14', '1400 Main St, District 14', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456714', '08:00 - 23:00', 'Active'),
(2015, 'CineBook Cinema 15', '1500 Main St, District 15', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456715', '08:00 - 23:00', 'Active'),
(2016, 'CineBook Cinema 16', '1600 Main St, District 16', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456716', '08:00 - 23:00', 'Active'),
(2017, 'CineBook Cinema 17', '1700 Main St, District 17', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456717', '08:00 - 23:00', 'Active'),
(2018, 'CineBook Cinema 18', '1800 Main St, District 18', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456718', '08:00 - 23:00', 'Active'),
(2019, 'CineBook Cinema 19', '1900 Main St, District 19', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456719', '08:00 - 23:00', 'Active'),
(2020, 'CineBook Cinema 20', '2000 Main St, District 20', 'Hồ Chí Minh', 10.762622, 106.660172, '0123456720', '08:00 - 23:00', 'Active');

-- Movies
INSERT IGNORE INTO Movies (movie_id, title, synopsis, duration_min, release_date, age_rating, language, director, cast_list, poster_url, trailer_url, status) VALUES
(3001, 'Dummy Movie 1', 'This is a great movie about amazing things.', 91, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 1', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'NowShowing'),
(3002, 'Dummy Movie 2', 'This is a great movie about amazing things.', 92, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 2', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'NowShowing'),
(3003, 'Dummy Movie 3', 'This is a great movie about amazing things.', 93, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 3', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'NowShowing'),
(3004, 'Dummy Movie 4', 'This is a great movie about amazing things.', 94, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 4', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'NowShowing'),
(3005, 'Dummy Movie 5', 'This is a great movie about amazing things.', 95, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 5', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'NowShowing'),
(3006, 'Dummy Movie 6', 'This is a great movie about amazing things.', 96, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 6', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'NowShowing'),
(3007, 'Dummy Movie 7', 'This is a great movie about amazing things.', 97, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 7', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'NowShowing'),
(3008, 'Dummy Movie 8', 'This is a great movie about amazing things.', 98, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 8', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'NowShowing'),
(3009, 'Dummy Movie 9', 'This is a great movie about amazing things.', 99, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 9', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'NowShowing'),
(3010, 'Dummy Movie 10', 'This is a great movie about amazing things.', 100, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 10', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'NowShowing'),
(3011, 'Dummy Movie 11', 'This is a great movie about amazing things.', 101, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 11', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'ComingSoon'),
(3012, 'Dummy Movie 12', 'This is a great movie about amazing things.', 102, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 12', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'ComingSoon'),
(3013, 'Dummy Movie 13', 'This is a great movie about amazing things.', 103, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 13', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'ComingSoon'),
(3014, 'Dummy Movie 14', 'This is a great movie about amazing things.', 104, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 14', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'ComingSoon'),
(3015, 'Dummy Movie 15', 'This is a great movie about amazing things.', 105, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 15', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'ComingSoon'),
(3016, 'Dummy Movie 16', 'This is a great movie about amazing things.', 106, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 16', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'ComingSoon'),
(3017, 'Dummy Movie 17', 'This is a great movie about amazing things.', 107, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 17', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'ComingSoon'),
(3018, 'Dummy Movie 18', 'This is a great movie about amazing things.', 108, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 18', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'ComingSoon'),
(3019, 'Dummy Movie 19', 'This is a great movie about amazing things.', 109, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 19', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'ComingSoon'),
(3020, 'Dummy Movie 20', 'This is a great movie about amazing things.', 110, '2026-06-01', 'PG-13', 'Vietnamese', 'Director 20', 'Actor A, Actor B', 'https://via.placeholder.com/300x450', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'ComingSoon');

-- FnBProducts
INSERT IGNORE INTO FnBProducts (product_id, name, description, category, price, status) VALUES
(4001, 'Dummy Drink 1', 'Delicious drink', 'Drink', 35000, 'Available'),
(4002, 'Dummy Popcorn 2', 'Delicious popcorn', 'Popcorn', 40000, 'Available'),
(4003, 'Dummy Combo 3', 'Delicious combo', 'Combo', 45000, 'Available'),
(4004, 'Dummy Drink 4', 'Delicious drink', 'Drink', 50000, 'Available'),
(4005, 'Dummy Popcorn 5', 'Delicious popcorn', 'Popcorn', 55000, 'Available'),
(4006, 'Dummy Combo 6', 'Delicious combo', 'Combo', 60000, 'Available'),
(4007, 'Dummy Drink 7', 'Delicious drink', 'Drink', 65000, 'Available'),
(4008, 'Dummy Popcorn 8', 'Delicious popcorn', 'Popcorn', 70000, 'Available'),
(4009, 'Dummy Combo 9', 'Delicious combo', 'Combo', 75000, 'Available'),
(4010, 'Dummy Drink 10', 'Delicious drink', 'Drink', 80000, 'Available'),
(4011, 'Dummy Popcorn 11', 'Delicious popcorn', 'Popcorn', 85000, 'Available'),
(4012, 'Dummy Combo 12', 'Delicious combo', 'Combo', 90000, 'Available'),
(4013, 'Dummy Drink 13', 'Delicious drink', 'Drink', 95000, 'Available'),
(4014, 'Dummy Popcorn 14', 'Delicious popcorn', 'Popcorn', 100000, 'Available'),
(4015, 'Dummy Combo 15', 'Delicious combo', 'Combo', 105000, 'Available'),
(4016, 'Dummy Drink 16', 'Delicious drink', 'Drink', 110000, 'Available'),
(4017, 'Dummy Popcorn 17', 'Delicious popcorn', 'Popcorn', 115000, 'Available'),
(4018, 'Dummy Combo 18', 'Delicious combo', 'Combo', 120000, 'Available'),
(4019, 'Dummy Drink 19', 'Delicious drink', 'Drink', 125000, 'Available'),
(4020, 'Dummy Popcorn 20', 'Delicious popcorn', 'Popcorn', 130000, 'Available');

-- PromoCodes
INSERT IGNORE INTO PromoCodes (promo_id, code, discount_type, discount_value, max_discount_vnd, min_order_value, usage_limit, used_count, valid_from, valid_until, status) VALUES
(5001, 'DUMMYCODE1', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5002, 'DUMMYCODE2', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5003, 'DUMMYCODE3', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5004, 'DUMMYCODE4', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5005, 'DUMMYCODE5', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5006, 'DUMMYCODE6', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5007, 'DUMMYCODE7', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5008, 'DUMMYCODE8', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5009, 'DUMMYCODE9', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5010, 'DUMMYCODE10', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5011, 'DUMMYCODE11', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5012, 'DUMMYCODE12', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5013, 'DUMMYCODE13', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5014, 'DUMMYCODE14', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5015, 'DUMMYCODE15', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5016, 'DUMMYCODE16', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5017, 'DUMMYCODE17', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5018, 'DUMMYCODE18', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5019, 'DUMMYCODE19', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active'),
(5020, 'DUMMYCODE20', 'Percentage', 10, 50000, 100000, 100, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Active');

-- MovieGenres
INSERT IGNORE INTO MovieGenres (movie_id, genre_id) VALUES
(3001, 1), (3001, 5),
(3002, 2), (3002, 3),
(3003, 4),
(3004, 1), (3004, 2),
(3005, 5), (3005, 6),
(3006, 3), (3006, 7),
(3007, 1), (3007, 4),
(3008, 2),
(3009, 5), (3009, 2),
(3010, 1),
(3011, 2), (3011, 6),
(3012, 3), (3012, 4),
(3013, 1),
(3014, 5),
(3015, 6),
(3016, 7),
(3017, 1), (3017, 3),
(3018, 2),
(3019, 4), (3019, 5),
(3020, 1), (3020, 2);
