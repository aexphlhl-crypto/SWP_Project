# 📅 Lộ Trình Commit Từng Ngày Cho 28 Ngày (Cập nhật mới nhất theo tiến độ dự án)

Sau khi quét lại mã nguồn mới nhất của dự án CineBook, tôi nhận thấy team đã có nhiều cập nhật quan trọng (thêm các file Migration V5 đến V12, bổ sung logic giữ ghế `SeatHold`, hook phân trang `use-client-pagination` và trang quản lý `reviews` cho Admin).

Dưới đây là lịch trình đã được **điều chỉnh lại** để tích hợp chính xác những file mới này vào các Sprint cho hợp lý.

---

## 🚀 SPRINT 1: Nền Tảng Cơ Bản (Ngày 1 - 7)

### Ngày 1: Base Entities & Cấu trúc UI
* **Trung**: Khởi tạo cấu trúc Spring Boot Auth và DB Init.
  * `backend/.../modules/users/User.java`, `UserRepository.java`
  * `backend/.../db/migration/V1__init_schema.sql`
  * `backend/.../db/migration/V2__seed_data.sql`
* **Vinh**: Base cho Movies & Thể loại.
  * `frontend/src/pages/Admin/movies/index.jsx`
  * `frontend/src/pages/Admin/genres/index.jsx`
* **Hiếu**: Khởi tạo Schema Phòng & Ghế.
  * `backend/.../modules/rooms/entity/Room.java`, `Seat.java`
  * `backend/.../db/migration/V4__Add_Room_Type.sql`
* **Tuấn Anh**: Setup UI Components chuẩn & Giao diện trang chủ.
  * `frontend/src/styles/globals.css`, `frontend/src/App.jsx`, `frontend/src/pages/Home.jsx`
  * Các file `frontend/src/components/ui/`

### Ngày 2 - 3: Auth Logic & Cinema Repo
* **Trung**: Luồng Register, Pending Users (Xác thực OTP) & Security.
  * `backend/.../security/JwtAuthFilter.java`, `JwtUtil.java`, `UserDetailsServiceImpl.java`
  * `backend/.../db/migration/V5__Add_Pending_Users_Table.sql`
  * `frontend/src/pages/register/index.jsx`
* **Vinh**: UI Upload Poster Phim & Danh sách phim.
  * `frontend/src/pages/Movies/index.jsx`, `NowShowing.jsx`, `ComingSoon.jsx`
* **Hiếu**: API Quản lý phòng chiếu & rạp.
  * `backend/.../modules/rooms/repository/RoomRepository.java`
  * `backend/.../modules/rooms/controller/RoomController.java`
  * `frontend/src/pages/Admin/cinemas/index.jsx`
* **Tuấn Anh**: Auth Context.
  * `frontend/src/contexts/auth-context.jsx`, `frontend/src/types/auth.ts`

### Ngày 4 - 5: Login & Chi tiết phim
* **Trung**: API Login & Quên mật khẩu.
  * `backend/.../modules/users/UserController.java`
  * `frontend/src/pages/login/index.jsx`, `frontend/src/pages/forgot-password/index.jsx`
* **Vinh**: Khách xem chi tiết phim.
  * `frontend/src/pages/Movies/MovieDetails.jsx`, `frontend/src/types/movie.ts`
* **Hiếu**: Seat Layout Logic cho Admin.
  * `backend/.../modules/rooms/repository/SeatRepository.java`
  * `frontend/src/lib/seat-layout.js`
  * `frontend/src/pages/Admin/rooms/index.jsx`
* **Tuấn Anh**: Booking Flow Framework.
  * `frontend/src/pages/Booking/BookingFlow.jsx`, `frontend/src/types/booking.ts`

### Ngày 6 - 7: Profile & Config Ghế
* **Trung**: Cập nhật Profile.
  * `frontend/src/pages/Profile/index.jsx`
  * `backend/.../modules/users/UserService.java`
* **Vinh**: Kết nối API cho list phim.
  * `frontend/src/contexts/data-context.jsx`
* **Hiếu**: UI Setup lưới ghế.
  * `frontend/src/pages/Admin/seats/index.jsx`
  * `backend/.../modules/rooms/dto/SeatConfigDto.java`
* **Tuấn Anh**: Chuẩn bị UI Chọn Rạp/Phim (Bước 1 Đặt vé).
  * `frontend/src/pages/Booking/index.jsx`

---

## 🛠 SPRINT 2: Cấu Hình Lịch Chiếu & Phân Quyền (Ngày 8 - 14)

### Ngày 8 - 10: Quản lý Roles & Lịch chiếu
* **Trung**: Migration Roles, Quản lý Customer & Manager.
  * `backend/.../db/migration/V8__Add_Manager_User.sql`
  * `backend/.../db/migration/V9__Add_Admin_User.sql`
  * `frontend/src/pages/Admin/customers/index.jsx`, `managers/index.jsx`
  * `frontend/src/hooks/use-client-pagination.js` (Thêm hook phân trang UI)
* **Vinh**: F&B Mgmt (Concessions).
  * `frontend/src/pages/Admin/concessions/index.jsx`
* **Hiếu**: Phân rạp cho nhân viên & Khởi tạo Lịch chiếu.
  * `backend/.../db/migration/V7__Add_User_Cinema_Id.sql`
  * `backend/.../modules/showtimes/entity/Showtime.java`, `ShowtimeRepository.java`
* **Tuấn Anh**: Interactive Seat Map.
  * Các Select, Radio group, Toggle cho UI ghế trong `components/ui/`

### Ngày 11 - 14: Conflict Check, Khuyến mãi & API Lịch chiếu
* **Trung**: Dashboard Báo Cáo.
  * `frontend/src/pages/Admin/analytics/index.jsx`
* **Vinh**: Promo Code Schema & UI.
  * `backend/.../modules/promos/entity/PromoCode.java`, `PromoController.java`
  * `frontend/src/pages/Admin/promotions/index.jsx`
* **Hiếu**: Conflict Check Lịch Chiếu.
  * `backend/.../modules/showtimes/service/ShowtimeService.java`
  * `frontend/src/pages/Admin/showtimes/index.jsx`, `frontend/src/lib/schedule-utils.js`
* **Tuấn Anh**: Guest xem lịch rạp chiếu.
  * `frontend/src/pages/cinemas/index.jsx`, `frontend/src/types/schedule.ts`

---

## 🎟 SPRINT 3: Thanh Toán, Giữ Ghế & P2P Resale (Ngày 15 - 21)

### Ngày 15 - 17: Giữ Ghế (Seat Hold), P2P Ticket Base & Checkout
* **Trung**: Logic thống kê & Thông báo (Notifications).
  * `backend/.../db/migration/V3__Add_Notifications_Table.sql`
* **Vinh**: Database Sàn trao đổi vé (P2P).
  * `backend/.../db/migration/V10__Add_Resale_Listing_Fields.sql`
  * `backend/.../db/migration/V11__Add_Deleted_To_Resale_Listing_Status.sql`
  * `backend/.../modules/resale/entity/TicketExchangeListing.java`
  * `frontend/src/pages/resale/index.jsx`
* **Hiếu**: Logic Giữ Ghế (Seat Hold) khi khách đang thanh toán.
  * `backend/.../db/migration/V6__Add_Seat_Holds_Table.sql`
  * `backend/.../modules/showtimes/entity/SeatHold.java`
  * `backend/.../modules/showtimes/repository/SeatHoldRepository.java`
* **Tuấn Anh**: Hệ thống Thanh Toán VNPay Base.
  * `backend/.../modules/payments/entity/Payment.java`, `VNPayService.java`

### Ngày 18 - 21: Checkout, Resale API & Booking Complete
* **Trung**: Settings Admin.
  * `frontend/src/pages/Admin/settings/index.jsx`
* **Vinh**: API Quản lý Sàn P2P.
  * `backend/.../modules/resale/dto/ResaleListingUpdateRequest.java` (File mới thêm)
  * `backend/.../modules/resale/controller/ResaleListingController.java`
  * `frontend/src/pages/Admin/resale/index.jsx`, `frontend/src/pages/resale/ResaleDetail.jsx`
* **Hiếu**: Tối ưu UI Seat Status dựa trên bảng SeatHold.
  * `backend/.../modules/showtimes/dto/SeatStatusDto.java`
* **Tuấn Anh**: Hoàn thiện VNPay Checkout.
  * `backend/.../modules/payments/controller/PaymentController.java`
  * `frontend/src/pages/Payment/index.jsx`, `VNPayResult.jsx`

---

## 🎯 SPRINT 4: Review Phim, Fake Data & Go-Live (Ngày 22 - 28)

### Ngày 22 - 24: My Tickets & My Resale
* **Trung**: Dashboard UI.
  * `frontend/src/pages/Admin/index.jsx`
* **Vinh**: Đăng bán vé cá nhân.
  * `frontend/src/pages/my-resale/index.jsx`, `CreateResale.jsx`
  * `backend/.../modules/resale/scheduler/ResaleScheduler.java`
* **Hiếu**: Booking Admin View.
  * `frontend/src/pages/Admin/bookings/index.jsx`
* **Tuấn Anh**: My Tickets.
  * `frontend/src/pages/MyTickets/index.jsx`, `frontend/src/pages/Booking/Success.jsx`

### Ngày 25 - 26: Đánh giá Phim (Reviews), Tin Tức & Báo Cáo P2P
* **Trung**: Chuẩn bị Dummy Data test E2E.
  * `backend/.../db/migration/V12__Seed_Dummy_Data.sql`
* **Vinh**: Báo cáo P2P Resale.
  * `frontend/src/pages/Admin/resale/report/index.jsx`
* **Hiếu**: Tin tức & Banner (News).
  * `frontend/src/pages/Admin/news/index.jsx`, `frontend/src/pages/news/index.jsx`
* **Tuấn Anh**: Hệ thống Đánh giá phim (Review) dành cho User & Admin.
  * `backend/.../modules/reviews/entity/Review.java`, `ReviewController.java`
  * `frontend/src/pages/Admin/reviews/index.jsx` (File mới: Admin quản lý Review)

### Ngày 27 - 28: Đóng băng Code, Test E2E & Triển khai
* Xoá / Thay thế Mock Data trong thư mục `frontend/src/lib/mock-data.js` bằng Dummy Data từ V12.
* Tối ưu CSS Tailwind trong `frontend/src/styles/globals.css`.
* Cả 4 thành viên kiểm tra Hook `frontend/src/hooks/use-countdown.js` và Auto-release ghế bằng `SeatHold`.
* Test luồng: Đăng nhập -> Chọn Phim -> Chọn Ghế (Ghế bị lock vào SeatHold) -> VNPay Sandbox -> Nhả SeatHold & Tạo Ticket -> Viết đánh giá phim. 
* Đóng gói và chuẩn bị deploy.
