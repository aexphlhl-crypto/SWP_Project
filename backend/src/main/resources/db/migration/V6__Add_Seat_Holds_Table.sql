CREATE TABLE Seat_Holds (
    hold_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    showtime_id BIGINT UNSIGNED NOT NULL,
    seat_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seat_holds_showtime FOREIGN KEY (showtime_id) REFERENCES Showtimes(showtime_id) ON DELETE CASCADE,
    CONSTRAINT fk_seat_holds_seat FOREIGN KEY (seat_id) REFERENCES Seats(seat_id) ON DELETE CASCADE,
    CONSTRAINT fk_seat_holds_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Index to quickly find held seats for a showtime and clear expired ones
CREATE INDEX idx_seat_holds_showtime ON Seat_Holds(showtime_id);
CREATE INDEX idx_seat_holds_expires ON Seat_Holds(expires_at);
