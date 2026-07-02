-- Create Actors and MovieActors junction table

CREATE TABLE IF NOT EXISTS Actors (
    actor_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MovieActors (
    movie_id BIGINT UNSIGNED NOT NULL,
    actor_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (movie_id, actor_id),
    CONSTRAINT fk_movie_actors_movie FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_movie_actors_actor FOREIGN KEY (actor_id) REFERENCES Actors(actor_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Actors with names and beautiful Unsplash profile photo URLs
INSERT INTO Actors (actor_id, name, avatar_url) VALUES
(1, 'Steve Carell', 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=300&h=300&fit=crop&q=80'),
(2, 'Pierre Coffin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80'),
(3, 'Alan Arkin', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80'),
(4, 'Tom Holland', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&q=80'),
(5, 'Zendaya', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&q=80'),
(6, 'Benedict Cumberbatch', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80'),
(7, 'Christian Bale', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&q=80'),
(8, 'Heath Ledger', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&q=80'),
(9, 'Gary Oldman', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&q=80'),
(10, 'Amy Poehler', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&q=80'),
(11, 'Maya Hawke', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&q=80'),
(12, 'Kensington Tallman', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&q=80'),
(13, 'Sam Worthington', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80'),
(14, 'Zoe Saldana', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80'),
(15, 'Sigourney Weaver', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&q=80'),
(16, 'Timothée Chalamet', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&q=80'),
(17, 'Rebecca Ferguson', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&q=80'),
(18, 'Kristen Wiig', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80'),
(19, 'Will Ferrell', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80'),
(20, 'Rebecca Hall', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&q=80'),
(21, 'Brian Tyree Henry', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&q=80'),
(22, 'Dan Stevens', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80'),
(23, 'Cillian Murphy', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&q=80'),
(24, 'Emily Blunt', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80'),
(25, 'Matt Damon', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80'),
(26, 'Lupita Nyong\'o', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&q=80'),
(27, 'Joseph Quinn', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80'),
(28, 'Alex Wolff', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&q=80'),
(29, 'Jack Black', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80'),
(30, 'Awkwafina', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80'),
(31, 'Viola Davis', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&q=80'),
(32, 'Ma Dong-seok', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&q=80'),
(33, 'Kim Mu-yeol', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80'),
(34, 'Park Ji-hwan', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&q=80'),
(35, 'Owen Teague', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80'),
(36, 'Freya Allan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&q=80'),
(37, 'Kevin Durand', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&q=80'),
(38, 'Chris Pratt', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80'),
(39, 'Samuel L. Jackson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80'),
(40, 'Hannah Waddingham', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&q=80'),
(41, 'Ryan Reynolds', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80'),
(42, 'Hugh Jackman', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&q=80'),
(43, 'Emma Corrin', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&q=80'),
(44, 'Anya Taylor-Joy', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80'),
(45, 'Chris Hemsworth', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80'),
(46, 'Tom Burke', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80'),
(47, 'Dakota Fanning', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&q=80'),
(48, 'Georgina Campbell', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80'),
(49, 'Olwen Fouéré', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&q=80'),
(50, 'Will Smith', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80'),
(51, 'Martin Lawrence', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&q=80'),
(52, 'Vanessa Hudgens', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80'),
(53, 'Ryan Gosling', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80'),
(54, 'Aaron Taylor-Johnson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80'),
(55, 'Thanh Hiền', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&q=80'),
(56, 'Trương Minh Cường', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&q=80'),
(57, 'Đinh Y Nhung', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80')
ON DUPLICATE KEY UPDATE name=name;

-- Map MovieActors (Many-to-Many linking for existing movies)
INSERT INTO MovieActors (movie_id, actor_id) VALUES
-- Movie 3001: Minions
(3001, 1), (3001, 2), (3001, 3),
-- Movie 3002: Spider-Man
(3002, 4), (3002, 5), (3002, 6),
-- Movie 3003: Batman Dark Knight
(3003, 7), (3003, 8), (3003, 9),
-- Movie 3004: Inside Out 2
(3004, 10), (3004, 11), (3004, 12),
-- Movie 3005: Avatar 2
(3005, 13), (3005, 14), (3005, 15),
-- Movie 3006: Dune 2
(3006, 16), (3006, 5), (3006, 17),
-- Movie 3007: Despicable Me 4
(3007, 1), (3007, 18), (3007, 19),
-- Movie 3008: Godzilla x Kong
(3008, 20), (3008, 21), (3008, 22),
-- Movie 3009: Oppenheimer
(3009, 23), (3009, 24), (3009, 25),
-- Movie 3010: A Quiet Place Day One
(3010, 26), (3010, 27), (3010, 28),
-- Movie 3011: Kung Fu Panda 4
(3011, 29), (3011, 30), (3011, 31),
-- Movie 3012: The Roundup
(3012, 32), (3012, 33), (3012, 34),
-- Movie 3013: Kingdom of Planet of Apes
(3013, 35), (3013, 36), (3013, 37),
-- Movie 3014: Garfield
(3014, 38), (3014, 39), (3014, 40),
-- Movie 3015: Deadpool & Wolverine
(3015, 41), (3015, 42), (3015, 43),
-- Movie 3016: Furiosa
(3016, 44), (3016, 45), (3016, 46),
-- Movie 3017: The Watchers
(3017, 47), (3017, 48), (3017, 49),
-- Movie 3018: Bad Boys
(3018, 50), (3018, 51), (3018, 52),
-- Movie 3019: Fall Guy
(3019, 53), (3019, 24), (3019, 54),
-- Movie 3020: Lat Mat 7
(3020, 55), (3020, 56), (3020, 57);
