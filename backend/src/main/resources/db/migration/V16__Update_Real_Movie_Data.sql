-- Update Dummy Movie Data with Real Movie Titles, Synopsis, Duration, and Working Image URLs from Unsplash
-- Using only allowed MySQL ENUM values for age_rating: 'G','PG','PG-13','R','NC-17'

UPDATE Movies SET
    title = 'Minions: Sự Trỗi Dậy Của Gru',
    synopsis = 'Hành trình trở thành siêu ác nhân vĩ đại nhất thế giới của cậu bé Gru 12 tuổi cùng sự trợ giúp đắc lực của các sinh vật màu vàng siêu quậy.',
    duration_min = 88,
    age_rating = 'G',
    director = 'Kyle Balda',
    cast_list = 'Steve Carell, Pierre Coffin, Alan Arkin',
    poster_url = 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=6DxjJzmReXo'
WHERE movie_id = 3001;

UPDATE Movies SET
    title = 'Spider-Man: Không Còn Đường Về',
    synopsis = 'Lần đầu tiên trong lịch sử điện ảnh của Người Nhện, danh tính người hùng hàng xóm thân thiện bị vạch trần, buộc anh phải tìm đến Doctor Strange để giải quyết rắc rối.',
    duration_min = 148,
    age_rating = 'PG-13',
    director = 'Jon Watts',
    cast_list = 'Tom Holland, Zendaya, Benedict Cumberbatch',
    poster_url = 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=JfVOs4VSpmA'
WHERE movie_id = 3002;

UPDATE Movies SET
    title = 'Người Dơi: Kỵ Sĩ Bóng Đêm',
    synopsis = 'Khi mối đe dọa được gọi là Joker phá hoại và gây ra hỗn loạn cho người dân Gotham, Batman phải đối mặt với thử thách tâm lý lớn nhất để chống lại tội ác.',
    duration_min = 152,
    age_rating = 'R',
    director = 'Christopher Nolan',
    cast_list = 'Christian Bale, Heath Ledger, Gary Oldman',
    poster_url = 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=EXeTwQWrcwY'
WHERE movie_id = 3003;

UPDATE Movies SET
    title = 'Inside Out 2: Những Mảnh Ghép Cảm Xúc 2',
    synopsis = 'Quay trở lại tâm trí của cô bé Riley lúc này đã là một thiếu niên, trung tâm điều khiển cảm xúc đột ngột trải qua một đợt cải tạo để nhường chỗ cho những Cảm xúc Mới!',
    duration_min = 96,
    age_rating = 'G',
    director = 'Kelsey Mann',
    cast_list = 'Amy Poehler, Maya Hawke, Kensington Tallman',
    poster_url = 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=LEjhY15eCx0'
WHERE movie_id = 3004;

UPDATE Movies SET
    title = 'Avatar: Dòng Chảy Của Nước',
    synopsis = 'Jake Sully sống cùng gia đình mới thành lập trên hành tinh Pandora. Khi một mối đe dọa quen thuộc quay trở lại để hoàn thành những gì họ đã bắt đầu, Jake phải hợp tác với Neytiri và quân đội của bộ tộc Na\'vi để bảo vệ hành tinh của họ.',
    duration_min = 192,
    age_rating = 'PG-13',
    director = 'James Cameron',
    cast_list = 'Sam Worthington, Zoe Saldana, Sigourney Weaver',
    poster_url = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=d9MyW72ELq0'
WHERE movie_id = 3005;

UPDATE Movies SET
    title = 'Dune: Hành Tinh Cát - Phần Hai',
    synopsis = 'Paul Atreides kết hợp với Chani và người Fremen để trả thù những kẻ đã hủy hoại gia đình mình, đồng thời nỗ lực ngăn chặn tương lai khủng khiếp mà chỉ mình anh có thể thấy trước.',
    duration_min = 166,
    age_rating = 'PG-13',
    director = 'Denis Villeneuve',
    cast_list = 'Timothée Chalamet, Zendaya, Rebecca Ferguson',
    poster_url = 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=Way9Dexny3w'
WHERE movie_id = 3006;

UPDATE Movies SET
    title = 'Kẻ Trộm Mặt Trăng 4',
    synopsis = 'Gru, Lucy, Margo, Edith và Agnes chào đón một thành viên mới trong gia đình, Gru Jr., người có ý định hành hạ cha mình. Tuy nhiên, họ buộc phải chạy trốn khi kẻ thù mới vượt ngục và thề sẽ trả thù Gru.',
    duration_min = 94,
    age_rating = 'G',
    director = 'Chris Renaud',
    cast_list = 'Steve Carell, Kristen Wiig, Will Ferrell',
    poster_url = 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=H77sJ7S9X90'
WHERE movie_id = 3007;

UPDATE Movies SET
    title = 'Godzilla x Kong: Đế Chế Mới',
    synopsis = 'Hai sinh vật khổng lồ Godzilla và Kong phải cùng nhau đối mặt với một mối đe dọa tiềm ẩn sâu trong lòng Trái Đất, đe dọa sự sinh tồn của cả nhân loại và thế giới của họ.',
    duration_min = 115,
    age_rating = 'PG-13',
    director = 'Adam Wingard',
    cast_list = 'Rebecca Hall, Brian Tyree Henry, Dan Stevens',
    poster_url = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=lV1OOlGwExM'
WHERE movie_id = 3008;

UPDATE Movies SET
    title = 'Oppenheimer (Kẻ Hủy Diệt Thế Giới)',
    synopsis = 'Câu chuyện đầy kịch tính về nhà vật lý lý thuyết J. Robert Oppenheimer trong dự án Manhattan thiết kế và phát triển những quả bom nguyên tử đầu tiên cứu thế giới nhưng cũng đe dọa hủy diệt nó.',
    duration_min = 180,
    age_rating = 'R',
    director = 'Christopher Nolan',
    cast_list = 'Cillian Murphy, Emily Blunt, Matt Damon',
    poster_url = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=uYPbbEGQyec'
WHERE movie_id = 3009;

UPDATE Movies SET
    title = 'Vùng Đất Câm Lặng: Ngày Một',
    synopsis = 'Khám phá khởi đầu của thảm họa khủng khiếp khi thế giới đổ sụp bởi các sinh vật ngoài hành tinh nhạy bén với âm thanh. Một cô gái trẻ phải tìm cách sống sót tại thành phố New York đầy náo nhiệt.',
    duration_min = 99,
    age_rating = 'R',
    director = 'Michael Sarnoski',
    cast_list = 'Lupita Nyong\'o, Joseph Quinn, Alex Wolff',
    poster_url = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=YPY7J-flzE8'
WHERE movie_id = 3010;

UPDATE Movies SET
    title = 'Kung Fu Panda 4',
    synopsis = 'Po được chuẩn bị để trở thành Thủ lĩnh tinh thần của Thung lũng Hòa bình, nhưng trước tiên anh cần tìm và huấn luyện một Chiến binh Rồng mới, trong khi đối mặt với phản diện Tắc Kè Hoa xảo quyệt.',
    duration_min = 94,
    age_rating = 'PG',
    director = 'Mike Mitchell',
    cast_list = 'Jack Black, Awkwafina, Viola Davis',
    poster_url = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=_inKs4EE9UM'
WHERE movie_id = 3011;

UPDATE Movies SET
    title = 'Vây Hãm: Kẻ Trừng Phạt',
    synopsis = 'Thám tử Ma Seok-do đối đầu với một tổ chức tội phạm cờ bạc trực tuyến quy mô lớn xuyên quốc gia do cựu đặc nhiệm Baek Chang-ki cầm đầu.',
    duration_min = 109,
    age_rating = 'R',
    director = 'Heo Myeong-haeng',
    cast_list = 'Ma Dong-seok, Kim Mu-yeol, Park Ji-hwan',
    poster_url = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=3Wz_YQ6y18U'
WHERE movie_id = 3012;

UPDATE Movies SET
    title = 'Hành Tinh Khỉ: Vương Quốc Mới',
    synopsis = 'Nieu thế hệ sau triều đại của Caesar, loài khỉ trở thành bá chủ trong khi con người bị đẩy lùi vào bóng tối. Một thủ lĩnh khỉ mới bạo chúa bắt đầu xây dựng đế chế của mình bằng cách nô dịch các bộ tộc khác.',
    duration_min = 145,
    age_rating = 'PG-13',
    director = 'Wes Ball',
    cast_list = 'Owen Teague, Freya Allan, Kevin Durand',
    poster_url = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=Kdr5eed110w'
WHERE movie_id = 3013;

UPDATE Movies SET
    title = 'Garfield: Mèo Béo Siêu Quậy',
    synopsis = 'Sau một cuộc hội ngộ bất ngờ với người cha đã thất lạc từ lâu của mình - chú mèo đường phố nhếch nhác Vic - Garfield và người bạn cún Odie bị buộc phải rời khỏi cuộc sống nuông chiều hoàn hảo của họ.',
    duration_min = 101,
    age_rating = 'PG',
    director = 'Mark Dindal',
    cast_list = 'Chris Pratt, Samuel L. Jackson, Hannah Waddingham',
    poster_url = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=IeFWNtMo1Fs'
WHERE movie_id = 3014;

UPDATE Movies SET
    title = 'Deadpool & Wolverine',
    synopsis = 'Deadpool vô lo vô nghĩ bị tổ chức TVA bắt cóc và kéo vào một nhiệm vụ khẩn cấp nhằm bảo vệ vũ trụ của mình. Anh buộc phải tìm kiếm và thuyết phục một Wolverine bất đắc dĩ hợp tác.',
    duration_min = 127,
    age_rating = 'R',
    director = 'Shawn Levy',
    cast_list = 'Ryan Reynolds, Hugh Jackman, Emma Corrin',
    poster_url = 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=73_1biulk6g'
WHERE movie_id = 3015;

UPDATE Movies SET
    title = 'Furiosa: Chiến Binh Điên Cuồng',
    synopsis = 'Hành trình sinh tồn khốc liệt của cô gái trẻ Furiosa sau khi bị cướp đi khỏi Vùng Xanh trù phú bởi một băng đảng biker man rợ do bạo chúa Dementus dẫn đầu.',
    duration_min = 148,
    age_rating = 'R',
    director = 'George Miller',
    cast_list = 'Anya Taylor-Joy, Chris Hemsworth, Tom Burke',
    poster_url = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=XJMuhwVlca4'
WHERE movie_id = 3016;

UPDATE Movies SET
    title = 'Những Kẻ Theo Dõi',
    synopsis = 'Mina, một nghệ sĩ trẻ tuổi, bị lạc trong một khu rừng hoang sơ ở miền Tây Ireland. Khi tìm thấy nơi trú ẩn, cô bất ngờ bị giam giữ cùng ba người lạ khác, bị rình rập bởi những sinh vật huyền bí đáng sợ.',
    duration_min = 102,
    age_rating = 'R',
    director = 'Ishana Night Shyamalan',
    cast_list = 'Dakota Fanning, Georgina Campbell, Olwen Fouéré',
    poster_url = 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=3KzJ4f5w5vY'
WHERE movie_id = 3017;

UPDATE Movies SET
    title = 'Bad Boys: Ride or Die',
    synopsis = 'Cặp đôi bài trùng cảnh sát bá đạo nhất Miami Mike Lowrey và Marcus Burnett tái xuất giang hồ. Nhưng lần này, họ phải chạy trốn và tự minh oan khi vị sếp cũ quá cố bị vu khống liên kết với thế giới ngầm.',
    duration_min = 115,
    age_rating = 'R',
    director = 'Adil El Arbi',
    cast_list = 'Will Smith, Martin Lawrence, Vanessa Hudgens',
    poster_url = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=hAC0OMgMqqU'
WHERE movie_id = 3018;

UPDATE Movies SET
    title = 'Chàng Liên Lạc Đa Năng',
    synopsis = 'Một diễn viên đóng thế đã giải nghệ phải quay lại làm việc để tìm kiếm một ngôi sao điện ảnh bị mất tích của bộ phim bom tấn do bạn gái cũ làm đạo diễn.',
    duration_min = 126,
    age_rating = 'PG-13',
    director = 'David Leitch',
    cast_list = 'Ryan Gosling, Emily Blunt, Aaron Taylor-Johnson',
    poster_url = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=j7jPnyguzS8'
WHERE movie_id = 3019;

UPDATE Movies SET
    title = 'Lật Mặt 7: Một Điều Ước',
    synopsis = 'Câu chuyện gia đình đầy cảm xúc về bà mẹ già nuôi nấng 5 người con khôn lớn, nhưng khi bà gặp nạn gãy chân, ai sẽ là người về chăm sóc và phụng dưỡng bà?',
    duration_min = 138,
    age_rating = 'PG',
    director = 'Lý Hải',
    cast_list = 'Thanh Hiền, Trương Minh Cường, Đinh Y Nhung',
    poster_url = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&auto=format&fit=crop&q=80',
    trailer_url = 'https://www.youtube.com/watch?v=nPt8VzD2WvE'
WHERE movie_id = 3020;
