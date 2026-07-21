-- ============================================================
--  CineBook – Flyway Migration V1
--  Full schema from SRS v16
-- ============================================================

SET NAMES utf8mb4;

-- 1. USERS
CREATE TABLE IF NOT EXISTS Users (
    user_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100)    NOT NULL,
    email         VARCHAR(255)    NOT NULL UNIQUE,
    password_hash VARCHAR(255)    NOT NULL,
    phone         VARCHAR(20)     NULL,
    date_of_birth DATE            NULL,
    avatar_url    VARCHAR(500)    NULL,
    role          ENUM('Guest','Customer','ScheduleManager','SystemAdmin') NOT NULL DEFAULT 'Customer',
    status        ENUM('Active','Inactive','Locked') NOT NULL DEFAULT 'Active',
    google_uid    VARCHAR(255)    NULL UNIQUE,
    latitude      DECIMAL(10,6)   NULL,
    longitude     DECIMAL(10,6)   NULL,
    address       VARCHAR(200)    NULL,
    last_login_at DATETIME        NULL,
    failed_login_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
    locked_until  DATETIME        NULL,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    DATETIME        NULL,
    INDEX idx_users_email  (email),
    INDEX idx_users_role   (role),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. REFRESH TOKENS
CREATE TABLE IF NOT EXISTS RefreshTokens (
    token_id    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,
    token_hash  VARCHAR(255)    NOT NULL UNIQUE,
    expires_at  DATETIME        NOT NULL,
    is_revoked  TINYINT(1)      NOT NULL DEFAULT 0,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_rt_user    (user_id),
    INDEX idx_rt_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. OTP TOKENS
CREATE TABLE IF NOT EXISTS OtpTokens (
    otp_id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,
    token_type  ENUM('EmailVerification','PasswordReset','TempPassword') NOT NULL,
    token_value VARCHAR(255)    NOT NULL,
    expires_at  DATETIME        NOT NULL,
    is_used     TINYINT(1)      NOT NULL DEFAULT 0,
    retry_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_otp_user    (user_id),
    INDEX idx_otp_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ACTIVITY LOG
CREATE TABLE IF NOT EXISTS ActivityLog (
    log_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    actor_id      BIGINT UNSIGNED NULL,
    event_type    VARCHAR(100)    NOT NULL,
    target_entity VARCHAR(100)    NULL,
    target_id     BIGINT UNSIGNED NULL,
    ip_address    VARCHAR(45)     NULL,
    description   TEXT            NULL,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_al_actor FOREIGN KEY (actor_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    INDEX idx_al_actor   (actor_id),
    INDEX idx_al_event   (event_type),
    INDEX idx_al_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. SYSTEM CONFIG
CREATE TABLE IF NOT EXISTS SystemConfig (
    config_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    config_key   VARCHAR(50)  NOT NULL UNIQUE,
    config_value VARCHAR(200) NOT NULL,
    config_type  ENUM('String','Integer','Decimal','Boolean','JSON') NOT NULL DEFAULT 'String',
    description  TEXT         NULL,
    updated_by   BIGINT UNSIGNED NULL,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sc_updated_by FOREIGN KEY (updated_by) REFERENCES Users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO SystemConfig (config_key, config_value, config_type, description) VALUES
('seat_vip_multiplier',    '1.50', 'Decimal', 'VIP seat price multiplier'),
('seat_couple_multiplier', '2.00', 'Decimal', 'Couple seat price multiplier'),
('seat_hold_minutes',      '10',   'Integer', 'Minutes a seat is held after selection'),
('otp_validity_minutes',   '10',   'Integer', 'OTP validity window in minutes'),
('max_seats_per_booking',  '8',    'Integer', 'Maximum seats per booking'),
('vat_rate',               '0.10', 'Decimal', 'VAT rate applied to all bookings (0.00-1.00)'),
('weekend_day_multiplier', '1.20', 'Decimal', 'Weekend/holiday surcharge multiplier'),
('holiday_dates',          '[]',   'JSON',    'JSON array of public holiday dates YYYY-MM-DD');

-- 6. GENRES
CREATE TABLE IF NOT EXISTS Genres (
    genre_id   TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Genres (name) VALUES ('Action'),('Comedy'),('Drama'),('Horror'),('Sci-Fi'),('Animation'),('Documentary'),('Other');

-- 7. MOVIES
CREATE TABLE IF NOT EXISTS Movies (
    movie_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title          VARCHAR(200)  NOT NULL,
    synopsis       TEXT          NULL,
    duration_min   SMALLINT UNSIGNED NOT NULL,
    release_date   DATE          NOT NULL,
    age_rating     ENUM('G','PG','PG-13','R','NC-17') NOT NULL,
    language       ENUM('Vietnamese','English','Korean','Japanese','Other') NOT NULL,
    director       VARCHAR(100)  NULL,
    cast_list      VARCHAR(500)  NULL,
    poster_url     VARCHAR(500)  NULL,
    trailer_url    VARCHAR(500)  NULL,
    avg_rating     DECIMAL(3,2)  NOT NULL DEFAULT 0.00,
    review_count   INT UNSIGNED  NOT NULL DEFAULT 0,
    status         ENUM('Hidden','ComingSoon','NowShowing','Removed') NOT NULL DEFAULT 'Hidden',
    created_by     BIGINT UNSIGNED NULL,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at     DATETIME      NULL,
    CONSTRAINT fk_movie_created_by FOREIGN KEY (created_by) REFERENCES Users(user_id) ON DELETE SET NULL,
    INDEX idx_movie_status       (status),
    INDEX idx_movie_release_date (release_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. MOVIE GENRES
CREATE TABLE IF NOT EXISTS MovieGenres (
    movie_id  BIGINT UNSIGNED  NOT NULL,
    genre_id  TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    CONSTRAINT fk_mg_movie FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_mg_genre FOREIGN KEY (genre_id) REFERENCES Genres(genre_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. MOVIE SUBTITLES
CREATE TABLE IF NOT EXISTS MovieSubtitles (
    subtitle_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    movie_id    BIGINT UNSIGNED NOT NULL,
    language    ENUM('Vietnamese','English','Korean','Japanese','Other') NOT NULL,
    CONSTRAINT fk_ms_movie FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE,
    UNIQUE KEY uq_movie_subtitle_lang (movie_id, language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. CINEMAS
CREATE TABLE IF NOT EXISTS Cinemas (
    cinema_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150)   NOT NULL UNIQUE,
    address         VARCHAR(300)   NOT NULL,
    city            VARCHAR(100)   NOT NULL,
    latitude        DECIMAL(10,6)  NOT NULL,
    longitude       DECIMAL(10,6)  NOT NULL,
    phone           VARCHAR(20)    NULL,
    operating_hours VARCHAR(200)   NULL,
    status          ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cinema_status (status),
    INDEX idx_cinema_city   (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. ROOMS
CREATE TABLE IF NOT EXISTS Rooms (
    room_id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cinema_id        BIGINT UNSIGNED NOT NULL,
    name             VARCHAR(50)    NOT NULL,
    rows_count       TINYINT UNSIGNED NOT NULL,
    columns_count    TINYINT UNSIGNED NOT NULL,
    capacity         SMALLINT UNSIGNED NOT NULL,
    base_normal_price INT UNSIGNED  NOT NULL,
    seat_layout      JSON           NULL,
    status           ENUM('Active','UnderMaintenance','Inactive') NOT NULL DEFAULT 'Active',
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_cinema FOREIGN KEY (cinema_id) REFERENCES Cinemas(cinema_id) ON DELETE CASCADE,
    UNIQUE KEY uq_room_cinema_name (cinema_id, name),
    INDEX idx_room_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. SEATS
CREATE TABLE IF NOT EXISTS Seats (
    seat_id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id      BIGINT UNSIGNED NOT NULL,
    row_label    VARCHAR(5)     NOT NULL,
    col_number   TINYINT UNSIGNED NOT NULL,
    seat_label   VARCHAR(10)    NOT NULL,
    seat_type    ENUM('Normal','VIP','Couple') NOT NULL DEFAULT 'Normal',
    CONSTRAINT fk_seat_room FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
    UNIQUE KEY uq_seat_room_pos (room_id, row_label, col_number),
    INDEX idx_seat_type (seat_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. SHOWTIMES
CREATE TABLE IF NOT EXISTS Showtimes (
    showtime_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    movie_id           BIGINT UNSIGNED NOT NULL,
    cinema_id          BIGINT UNSIGNED NOT NULL,
    room_id            BIGINT UNSIGNED NOT NULL,
    start_time         DATETIME        NOT NULL,
    end_time           DATETIME        NOT NULL,
    price_override     INT UNSIGNED    NULL,
    status             ENUM('Scheduled','Cancelled') NOT NULL DEFAULT 'Scheduled',
    created_by         BIGINT UNSIGNED NULL,
    created_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_st_movie   FOREIGN KEY (movie_id)   REFERENCES Movies(movie_id)   ON DELETE RESTRICT,
    CONSTRAINT fk_st_cinema  FOREIGN KEY (cinema_id)  REFERENCES Cinemas(cinema_id) ON DELETE RESTRICT,
    CONSTRAINT fk_st_room    FOREIGN KEY (room_id)    REFERENCES Rooms(room_id)     ON DELETE RESTRICT,
    CONSTRAINT fk_st_created FOREIGN KEY (created_by) REFERENCES Users(user_id)    ON DELETE SET NULL,
    INDEX idx_st_movie  (movie_id),
    INDEX idx_st_cinema (cinema_id),
    INDEX idx_st_start  (start_time),
    INDEX idx_st_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. PROMO CODES
CREATE TABLE IF NOT EXISTS PromoCodes (
    promo_id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code              VARCHAR(20)    NOT NULL UNIQUE,
    discount_type     ENUM('Percentage','FixedAmount') NOT NULL,
    discount_value    DECIMAL(10,2)  NOT NULL,
    max_discount_vnd  INT UNSIGNED   NULL,
    min_order_value   INT UNSIGNED   NULL,
    usage_limit       INT UNSIGNED   NULL,
    used_count        INT UNSIGNED   NOT NULL DEFAULT 0,
    valid_from        DATETIME       NOT NULL,
    valid_until       DATETIME       NOT NULL,
    status            ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    created_by        BIGINT UNSIGNED NULL,
    created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pc_created FOREIGN KEY (created_by) REFERENCES Users(user_id) ON DELETE SET NULL,
    INDEX idx_pc_status (status),
    INDEX idx_pc_valid  (valid_from, valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. FNB PRODUCTS
CREATE TABLE IF NOT EXISTS FnBProducts (
    product_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100)   NOT NULL UNIQUE,
    description  VARCHAR(500)   NULL,
    category     ENUM('Popcorn','Drink','Combo') NOT NULL,
    price        INT UNSIGNED   NOT NULL,
    image_url    VARCHAR(500)   NULL,
    status       ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fnb_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. BOOKINGS
CREATE TABLE IF NOT EXISTS Bookings (
    booking_id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id          BIGINT UNSIGNED NOT NULL,
    showtime_id          BIGINT UNSIGNED NOT NULL,
    total_tickets_amount INT UNSIGNED    NOT NULL DEFAULT 0,
    total_fnb_amount     INT UNSIGNED    NOT NULL DEFAULT 0,
    sub_total            INT UNSIGNED    NOT NULL DEFAULT 0,
    discount_amount      INT UNSIGNED    NOT NULL DEFAULT 0,
    total_before_tax     INT UNSIGNED    NOT NULL DEFAULT 0,
    vat_rate_snapshot    DECIMAL(5,4)    NOT NULL DEFAULT 0.1000,
    vat_amount           INT UNSIGNED    NOT NULL DEFAULT 0,
    total_after_tax      INT UNSIGNED    NOT NULL DEFAULT 0,
    status               ENUM('Pending','Confirmed','CheckedIn','Failed','Cancelled','Expired') NOT NULL DEFAULT 'Pending',
    hold_expires_at      DATETIME        NULL,
    qr_code              VARCHAR(500)    NULL,
    promo_id             BIGINT UNSIGNED NULL,
    created_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bk_customer FOREIGN KEY (customer_id) REFERENCES Users(user_id)          ON DELETE RESTRICT,
    CONSTRAINT fk_bk_showtime FOREIGN KEY (showtime_id) REFERENCES Showtimes(showtime_id)  ON DELETE RESTRICT,
    CONSTRAINT fk_bk_promo    FOREIGN KEY (promo_id)    REFERENCES PromoCodes(promo_id)    ON DELETE SET NULL,
    INDEX idx_bk_customer (customer_id),
    INDEX idx_bk_showtime (showtime_id),
    INDEX idx_bk_status   (status),
    INDEX idx_bk_hold_exp (hold_expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. BOOKING SEATS
CREATE TABLE IF NOT EXISTS BookingSeats (
    booking_seat_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id      BIGINT UNSIGNED NOT NULL,
    seat_id         BIGINT UNSIGNED NOT NULL,
    seat_type       ENUM('Normal','VIP','Couple') NOT NULL,
    price_at_booking INT UNSIGNED   NOT NULL,
    CONSTRAINT fk_bs_booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_bs_seat    FOREIGN KEY (seat_id)    REFERENCES Seats(seat_id)       ON DELETE RESTRICT,
    UNIQUE KEY uq_bs_booking_seat (booking_id, seat_id),
    INDEX idx_bs_seat (seat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. PAYMENTS
CREATE TABLE IF NOT EXISTS Payments (
    payment_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id       BIGINT UNSIGNED NOT NULL,
    payment_method   ENUM('VNPay','MoMo','BankTransfer','Visa','Mastercard') NOT NULL,
    gateway_txn_id   VARCHAR(100)   NULL UNIQUE,
    amount           INT UNSIGNED   NOT NULL,
    status           ENUM('Pending','Success','Failed','Refunded') NOT NULL DEFAULT 'Pending',
    gateway_response JSON           NULL,
    paid_at          DATETIME       NULL,
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pay_booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE RESTRICT,
    INDEX idx_pay_booking (booking_id),
    INDEX idx_pay_status  (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. PROMO USAGES
CREATE TABLE IF NOT EXISTS PromoUsages (
    usage_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    promo_id   BIGINT UNSIGNED NOT NULL,
    user_id    BIGINT UNSIGNED NOT NULL,
    booking_id BIGINT UNSIGNED NOT NULL,
    used_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pu_promo   FOREIGN KEY (promo_id)   REFERENCES PromoCodes(promo_id)  ON DELETE CASCADE,
    CONSTRAINT fk_pu_user    FOREIGN KEY (user_id)    REFERENCES Users(user_id)         ON DELETE CASCADE,
    CONSTRAINT fk_pu_booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)  ON DELETE CASCADE,
    UNIQUE KEY uq_promo_user_booking (promo_id, user_id, booking_id),
    INDEX idx_pu_promo (promo_id),
    INDEX idx_pu_user  (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. FNB ORDER ITEMS
CREATE TABLE IF NOT EXISTS FnBOrderItems (
    item_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id     BIGINT UNSIGNED NOT NULL,
    product_id     BIGINT UNSIGNED NOT NULL,
    quantity       TINYINT UNSIGNED NOT NULL DEFAULT 1,
    unit_price     INT UNSIGNED    NOT NULL,
    CONSTRAINT fk_fnb_booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_fnb_product FOREIGN KEY (product_id) REFERENCES FnBProducts(product_id) ON DELETE RESTRICT,
    INDEX idx_fnb_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. REVIEWS
CREATE TABLE IF NOT EXISTS Reviews (
    review_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    movie_id    BIGINT UNSIGNED NOT NULL,
    booking_id  BIGINT UNSIGNED NOT NULL,
    rating      TINYINT UNSIGNED NOT NULL,
    comment     TEXT            NULL,
    status      ENUM('Active','Deleted') NOT NULL DEFAULT 'Active',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at  DATETIME        NULL,
    CONSTRAINT fk_rv_customer FOREIGN KEY (customer_id) REFERENCES Users(user_id)          ON DELETE RESTRICT,
    CONSTRAINT fk_rv_movie    FOREIGN KEY (movie_id)    REFERENCES Movies(movie_id)         ON DELETE CASCADE,
    CONSTRAINT fk_rv_booking  FOREIGN KEY (booking_id)  REFERENCES Bookings(booking_id)    ON DELETE RESTRICT,
    UNIQUE KEY uq_review_customer_movie (customer_id, movie_id),
    INDEX idx_rv_movie  (movie_id),
    INDEX idx_rv_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. TICKET EXCHANGE LISTINGS
CREATE TABLE IF NOT EXISTS TicketExchangeListings (
    listing_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id     BIGINT UNSIGNED NOT NULL,
    seller_id      BIGINT UNSIGNED NOT NULL,
    asking_price   INT UNSIGNED    NOT NULL DEFAULT 0,
    note           VARCHAR(200)    NULL,
    phone          VARCHAR(20)     NULL,
    facebook_url   VARCHAR(300)    NULL,
    status         ENUM('Active','Cancelled','Expired','Delisted','Hidden') NOT NULL DEFAULT 'Active',
    hidden_by      BIGINT UNSIGNED NULL,
    hidden_at      DATETIME        NULL,
    hidden_reason  TEXT            NULL,
    created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tel_booking   FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE RESTRICT,
    CONSTRAINT fk_tel_seller    FOREIGN KEY (seller_id)  REFERENCES Users(user_id)       ON DELETE RESTRICT,
    CONSTRAINT fk_tel_hidden_by FOREIGN KEY (hidden_by)  REFERENCES Users(user_id)       ON DELETE SET NULL,
    INDEX idx_tel_seller (seller_id),
    INDEX idx_tel_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. NEWS ARTICLES
CREATE TABLE IF NOT EXISTS NewsArticles (
    article_id    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(200)   NOT NULL,
    summary       VARCHAR(500)   NOT NULL,
    content       MEDIUMTEXT     NOT NULL,
    thumbnail_url VARCHAR(500)   NULL,
    publish_date  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status        ENUM('Draft','Published','Hidden') NOT NULL DEFAULT 'Draft',
    created_by    BIGINT UNSIGNED NULL,
    created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_na_created FOREIGN KEY (created_by) REFERENCES Users(user_id) ON DELETE SET NULL,
    INDEX idx_na_status       (status),
    INDEX idx_na_publish_date (publish_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
