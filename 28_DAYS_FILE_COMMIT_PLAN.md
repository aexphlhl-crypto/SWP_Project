# 📅 Lộ Trình Commit Từng Ngày Cho 28 Ngày (Dựa trên cấu trúc file thực tế CineBook)

Sau khi scan và mapping chính xác với cấu trúc file **thực tế hiện có** trong thư mục `CineBook` của nhóm (gồm các module Spring Boot: `users`, `rooms`, `showtimes`, `resale`, `payments`, `reviews` và các page React: `Admin`, `Booking`, `Movies`, `Payment`...), dưới đây là lịch trình commit chi tiết 100% bám sát mã nguồn của các bạn.

---

## 🚀 SPRINT 1: Nền Tảng Cơ Bản (Ngày 1 - 7)

### Ngày 1: Base Entities & Cấu trúc UI
* **Trung**: Khởi tạo cấu trúc Spring Boot Auth.
  * `backend/src/main/java/com/cinebook/backend/modules/users/User.java`
  * `backend/src/main/java/com/cinebook/backend/modules/users/UserRepository.java`
* **Vinh**: Base cho Movies & Thể loại (Genres).
  * `frontend/src/pages/Admin/movies/index.jsx`
  * `frontend/src/pages/Admin/genres/index.jsx`
* **Hiếu**: Khởi tạo Schema Phòng & Ghế.
  * `backend/src/main/java/com/cinebook/backend/modules/rooms/entity/Room.java`
  * `backend/src/main/java/com/cinebook/backend/modules/rooms/entity/Seat.java`
* **Tuấn Anh**: Setup UI Components chuẩn & Giao diện trang chủ.
  * `frontend/src/styles/globals.css`, `frontend/src/App.jsx`
  * `frontend/src/pages/Home.jsx`
  * Các file `frontend/src/components/ui/` (button, card, header, footer...)

### Ngày 2 - 3: Auth Logic & Cinema Repo
* **Trung**: Code luồng Register & Cấu hình JWT Security.
  * `backend/src/main/java/com/cinebook/backend/security/JwtAuthFilter.java`
  * `backend/src/main/java/com/cinebook/backend/security/JwtUtil.java`
  * `backend/src/main/java/com/cinebook/backend/security/UserDetailsServiceImpl.java`
  * `frontend/src/pages/register/index.jsx`
* **Vinh**: UI Upload Poster Phim & Danh sách phim.
  * `frontend/src/pages/Movies/index.jsx`
  * `frontend/src/pages/Movies/NowShowing.jsx`, `ComingSoon.jsx`
* **Hiếu**: API Quản lý phòng chiếu & rạp.
  * `backend/src/main/java/com/cinebook/backend/modules/rooms/repository/RoomRepository.java`
  * `backend/src/main/java/com/cinebook/backend/modules/rooms/controller/RoomController.java`
  * `frontend/src/pages/Admin/cinemas/index.jsx`
* **Tuấn Anh**: Auth Context.
  * `frontend/src/contexts/auth-context.jsx`
  * `frontend/src/types/auth.ts`

### Ngày 4 - 5: Login & Chi tiết phim
* **Trung**: API Login & Quên mật khẩu.
  * `backend/src/main/java/com/cinebook/backend/modules/users/UserController.java` (Login/Register endpoints)
  * `frontend/src/pages/login/index.jsx`
  * `frontend/src/pages/forgot-password/index.jsx`
* **Vinh**: Khách xem chi tiết phim (Guest Movie Detail).
  * `frontend/src/pages/Movies/MovieDetails.jsx`
  * `frontend/src/types/movie.ts`
* **Hiếu**: Seat Layout Logic cho Admin.
  * `backend/src/main/java/com/cinebook/backend/modules/rooms/repository/SeatRepository.java`
  * `frontend/src/lib/seat-layout.js`
  * `frontend/src/pages/Admin/rooms/index.jsx`
* **Tuấn Anh**: Booking Flow Framework.
  * `frontend/src/pages/Booking/BookingFlow.jsx`
  * `frontend/src/types/booking.ts`

### Ngày 6 - 7: Profile, Phân quyền & Config Ghế
* **Trung**: Cập nhật Profile.
  * `frontend/src/pages/Profile/index.jsx`
  * `backend/src/main/java/com/cinebook/backend/modules/users/UserService.java`
* **Vinh**: Kết nối API cho list phim.
  * `frontend/src/contexts/data-context.jsx` (Mock data/API call for movies)
* **Hiếu**: UI Setup lưới ghế.
  * `frontend/src/pages/Admin/seats/index.jsx`
  * `backend/src/main/java/com/cinebook/backend/modules/rooms/dto/SeatConfigDto.java`
* **Tuấn Anh**: Chuẩn bị UI Chọn Rạp/Phim (Bước 1 Đặt vé).
  * `frontend/src/pages/Booking/index.jsx`

---

## 🛠 SPRINT 2: Cấu Hình Lịch Chiếu & Sản Phẩm (Ngày 8 - 14)

### Ngày 8 - 10: Quản lý Lịch chiếu & Phân quyền User
* **Trung**: Quản lý Customer & Manager.
  * `frontend/src/pages/Admin/customers/index.jsx`
  * `frontend/src/pages/Admin/managers/index.jsx`
  * `backend/src/main/java/com/cinebook/backend/modules/users/dto/UserAdminDto.java`
* **Vinh**: F&B Mgmt (Concessions).
  * `frontend/src/pages/Admin/concessions/index.jsx`
* **Hiếu**: Khởi tạo Lịch chiếu (Showtime).
  * `backend/src/main/java/com/cinebook/backend/modules/showtimes/entity/Showtime.java`
  * `backend/src/main/java/com/cinebook/backend/modules/showtimes/repository/ShowtimeRepository.java`
* **Tuấn Anh**: Interactive Seat Map.
  * `frontend/src/components/ui/` (Tiếp tục hoàn thiện các Select, Radio group, Toggle cho UI ghế).

### Ngày 11 - 14: Conflict Check, Khuyến mãi & API Lịch chiếu
* **Trung**: Dashboard Báo Cáo.
  * `frontend/src/pages/Admin/analytics/index.jsx`
* **Vinh**: Promo Code Schema & UI.
  * `backend/src/main/java/com/cinebook/backend/modules/promos/entity/PromoCode.java`
  * `backend/src/main/java/com/cinebook/backend/modules/promos/controller/PromoController.java`
  * `frontend/src/pages/Admin/promotions/index.jsx`
* **Hiếu**: Conflict Check Lịch Chiếu.
  * `backend/src/main/java/com/cinebook/backend/modules/showtimes/service/ShowtimeService.java`
  * `backend/src/main/java/com/cinebook/backend/modules/showtimes/controller/ShowtimeController.java`
  * `frontend/src/pages/Admin/showtimes/index.jsx`
  * `frontend/src/lib/schedule-utils.js`
* **Tuấn Anh**: Guest xem lịch rạp chiếu.
  * `frontend/src/pages/cinemas/index.jsx`
  * `frontend/src/types/schedule.ts`

---

## 🎟 SPRINT 3: Thanh Toán, P2P Resale & Bookings (Ngày 15 - 21)

### Ngày 15 - 17: P2P Ticket Base & Checkout Framework
* **Trung**: Logic thống kê & Quản trị.
  * `backend/src/main/java/com/cinebook/backend/modules/users/TestSecurityController.java` (Test Role Permissions)
* **Vinh**: Hệ thống P2P Resale (Sàn trao đổi vé).
  * `backend/src/main/java/com/cinebook/backend/modules/resale/entity/TicketExchangeListing.java`
  * `backend/src/main/java/com/cinebook/backend/modules/resale/repository/ResaleListingRepository.java`
  * `frontend/src/pages/resale/index.jsx`
* **Hiếu**: Seat Status Logic (Ghế trống).
  * `backend/src/main/java/com/cinebook/backend/modules/showtimes/dto/SeatStatusDto.java`
* **Tuấn Anh**: Hệ thống Thanh Toán VNPay Base.
  * `backend/src/main/java/com/cinebook/backend/modules/payments/entity/Payment.java`
  * `backend/src/main/java/com/cinebook/backend/modules/payments/service/VNPayService.java`

### Ngày 18 - 21: Checkout, Resale API & Booking Complete
* **Trung**: Các tham số System Config & Settings.
  * `frontend/src/pages/Admin/settings/index.jsx`
* **Vinh**: API Quản lý Sàn P2P (Admin & Khách).
  * `backend/src/main/java/com/cinebook/backend/modules/resale/controller/ResaleListingController.java`
  * `backend/src/main/java/com/cinebook/backend/modules/resale/service/ResaleListingService.java`
  * `frontend/src/pages/resale/ResaleDetail.jsx`
  * `frontend/src/pages/Admin/resale/index.jsx`
* **Hiếu**: Map Layout & System Admin.
  * Cập nhật `frontend/src/lib/seat-layout.js` để match API
* **Tuấn Anh**: Hoàn thiện VNPay Checkout.
  * `backend/src/main/java/com/cinebook/backend/modules/payments/controller/PaymentController.java`
  * `frontend/src/pages/Payment/index.jsx`
  * `frontend/src/pages/Payment/VNPayResult.jsx`

---

## 🎯 SPRINT 4: Đánh bóng & Go-Live (Ngày 22 - 28)

### Ngày 22 - 24: My Tickets, F&B Concessions, và My Resale
* **Trung**: Admin Dashboard Statistics Data.
  * `frontend/src/pages/Admin/index.jsx` (Overview Dashboard)
* **Vinh**: Đăng bán vé cá nhân (My Resale).
  * `frontend/src/pages/my-resale/index.jsx`
  * `frontend/src/pages/my-resale/CreateResale.jsx`
  * `backend/src/main/java/com/cinebook/backend/modules/resale/scheduler/ResaleScheduler.java`
* **Hiếu**: Booking Admin View.
  * `frontend/src/pages/Admin/bookings/index.jsx`
* **Tuấn Anh**: My Tickets (Khách hàng xem vé đã mua).
  * `frontend/src/pages/MyTickets/index.jsx`
  * `frontend/src/pages/Booking/Success.jsx`

### Ngày 25 - 26: Đánh giá Phim & Report P2P
* **Trung**: Notifications Base.
  * `backend/src/main/java/com/cinebook/backend/modules/notifications/service/NotificationService.java`
* **Vinh**: Báo cáo P2P Resale.
  * `frontend/src/pages/Admin/resale/report/index.jsx`
* **Hiếu**: Tin tức & Banner (News).
  * `frontend/src/pages/Admin/news/index.jsx`
  * `frontend/src/pages/news/index.jsx`, `frontend/src/pages/news/NewsDetail.jsx`
* **Tuấn Anh**: Chức năng Đánh giá phim (Review).
  * `backend/src/main/java/com/cinebook/backend/modules/reviews/entity/Review.java`
  * `backend/src/main/java/com/cinebook/backend/modules/reviews/controller/ReviewController.java`
  * (Tích hợp UI vào `frontend/src/pages/Movies/MovieDetails.jsx`)

### Ngày 27 - 28: Đóng băng Code, Test E2E & Triển khai
* Xoá / Thay thế Mock Data trong thư mục `frontend/src/lib/mock-data.js`.
* Tối ưu CSS Tailwind trong `frontend/src/styles/globals.css`.
* Cả 4 thành viên kiểm tra Hook `frontend/src/hooks/use-countdown.js` và Auto-release ghế.
* Test luồng: Đăng nhập -> Chọn Phim -> Chọn Ghế -> VNPay Sandbox -> Mở QR vé -> Viết đánh giá phim. 
* Đóng gói và chuẩn bị deploy.
