ALTER TABLE Seats MODIFY COLUMN seat_type ENUM('Normal','VIP','Couple','Hidden') NOT NULL DEFAULT 'Normal';
ALTER TABLE BookingSeats MODIFY COLUMN seat_type ENUM('Normal','VIP','Couple','Hidden') NOT NULL;
