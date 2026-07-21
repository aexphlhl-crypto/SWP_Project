# 📁 Danh Sách File Dự Kiến Cần Commit (CineBook)

Dựa trên cấu trúc dự án (Backend là **Java/Spring Boot**, Frontend là **React/Vite**), đây là danh sách cụ thể các file/module mà mỗi thành viên cần tạo và commit trong quá trình phát triển để đảm bảo tính nhất quán.

---

## 🧑‍💻 1. Trung (Xác thực, Người dùng, Cấu hình & Báo cáo)

### Backend (Spring Boot - `backend/src/main/java/...`)
- **Entity & Repository**: 
  - `entity/User.java`, `entity/Role.java`
  - `repository/UserRepository.java`
- **Security & Auth**:
  - `security/JwtTokenProvider.java`
  - `security/JwtAuthenticationFilter.java`
  - `security/SecurityConfig.java`
- **Service**: 
  - `service/AuthService.java` (Login, Register, OTP, Reset Pass)
  - `service/UserService.java` (Quản lý users, update profile)
  - `service/ReportService.java` (Thống kê doanh thu, vé)
- **Controller & DTO**: 
  - `controller/AuthController.java`, `controller/UserController.java`, `controller/ReportController.java`
  - `dto/request/AuthRequest.java`, `dto/response/AuthResponse.java`

### Frontend (React/Vite - `frontend/src/...`)
- **Pages**:
  - `pages/auth/LoginPage.jsx`, `RegisterPage.jsx`, `ForgotPasswordPage.jsx`
  - `pages/profile/ProfilePage.jsx`
  - `pages/admin/UserManagementPage.jsx`
  - `pages/admin/ReportDashboardPage.jsx`
- **API Services**: 
  - `services/authApi.js`, `services/userApi.js`, `services/reportApi.js`
- **Components**:
  - `components/charts/RevenueChart.jsx`

---

## 🧑‍💻 2. Vinh (Quản lý Phim, F&B, Promo & Sàn P2P)

### Backend (Spring Boot - `backend/src/main/java/...`)
- **Entity & Repository**: 
  - `entity/Movie.java`, `entity/FoodBeverage.java`, `entity/PromoCode.java`, `entity/ResaleTicket.java`
  - `repository/MovieRepository.java`, `repository/FoodBeverageRepository.java`, `repository/ResaleTicketRepository.java`
- **Service**: 
  - `service/MovieService.java` (CRUD, Public Status)
  - `service/FoodBeverageService.java`
  - `service/PromoCodeService.java`
  - `service/ResaleTicketService.java` (Logic trao đổi vé P2P)
- **Controller & DTO**: 
  - `controller/MovieController.java`, `controller/FoodBeverageController.java`, `controller/ResaleTicketController.java`
  - `dto/request/MovieRequest.java`, `dto/request/ResaleRequest.java`

### Frontend (React/Vite - `frontend/src/...`)
- **Pages**:
  - `pages/admin/MovieManagementPage.jsx`, `FnbManagementPage.jsx`, `PromoManagementPage.jsx`
  - `pages/admin/AdminDashboardPage.jsx` (KPIs tĩnh)
  - `pages/p2p/TicketExchangeList.jsx` (Browse vé P2P)
  - `pages/p2p/MyResaleListings.jsx`
  - `pages/admin/AdminResaleMgmtPage.jsx`
- **API Services**: 
  - `services/movieApi.js`, `services/fnbApi.js`, `services/resaleApi.js`
- **Components**:
  - `components/movie/MovieForm.jsx` (Dùng cho Add/Edit Movie)
  - `components/p2p/ResaleCard.jsx`

---

## 🧑‍💻 3. Hiếu (Quản lý Rạp, Lịch chiếu, Map & Seat Layout)

### Backend (Spring Boot - `backend/src/main/java/...`)
- **Entity & Repository**: 
  - `entity/Cinema.java`, `entity/Room.java`, `entity/Seat.java`, `entity/Showtime.java`
  - `repository/CinemaRepository.java`, `repository/RoomRepository.java`, `repository/ShowtimeRepository.java`
- **Service**: 
  - `service/CinemaService.java` (CRUD rạp, phòng)
  - `service/ShowtimeService.java` (Tạo, xoá sửa, **Logic check trùng lịch**)
  - `service/SeatPricingService.java`
- **Controller & DTO**: 
  - `controller/CinemaController.java`, `controller/ShowtimeController.java`
  - `dto/request/ShowtimeRequest.java`

### Frontend (React/Vite - `frontend/src/...`)
- **Pages**:
  - `pages/admin/CinemaManagementPage.jsx`, `RoomManagementPage.jsx`
  - `pages/schedule/ScheduleDashboard.jsx` (Admin xem thống kê lấp đầy)
  - `pages/schedule/ShowtimeManagement.jsx` (Lịch tháng/tuần/năm)
  - `pages/guest/CinemaMapPage.jsx` (Google Maps API)
- **API Services**: 
  - `services/cinemaApi.js`, `services/showtimeApi.js`
- **Components**:
  - `components/cinema/SeatLayoutConfig.jsx` (Admin thiết lập map 2D)
  - `components/schedule/TimeSlotSelector.jsx` (Kéo thả chọn giờ)

---

## 🧑‍💻 4. Tuấn Anh (Luồng Đặt vé, Giao diện Khách hàng & Thanh toán)

### Backend (Spring Boot - `backend/src/main/java/...`)
- **Entity & Repository**: 
  - `entity/Booking.java`, `entity/Ticket.java`, `entity/Review.java`
  - `repository/BookingRepository.java`, `repository/TicketRepository.java`
- **Service**: 
  - `service/BookingService.java` (Logic tạo đơn, giữ ghế, apply promo)
  - `service/PaymentService.java` (Tích hợp MoMo / VNPay)
  - `service/TicketGenerationService.java` (Tạo mã QR)
- **Controller & DTO**: 
  - `controller/BookingController.java`, `controller/PaymentController.java`
  - `dto/request/BookingRequest.java`

### Frontend (React/Vite - `frontend/src/...`)
- **Pages**:
  - `pages/home/HomePage.jsx`
  - `pages/movie/GuestMovieDetail.jsx` (Xem chi tiết, Trailer, Review)
  - `pages/booking/BookingFlow.jsx` (Wrapper chính)
  - `pages/booking/steps/CinemaShowtimeSelect.jsx` (Bước 1)
  - `pages/booking/steps/SeatSelection.jsx` (Bước 2)
  - `pages/booking/steps/FnbSelection.jsx` (Bước 3)
  - `pages/booking/steps/PaymentPage.jsx` (Bước 4)
  - `pages/customer/MyBookings.jsx` (Lịch sử đặt vé)
- **API Services**: 
  - `services/bookingApi.js`, `services/paymentApi.js`
- **Components**:
  - `components/booking/InteractiveSeatMap.jsx` (Bản đồ ghế khách hàng click)
  - `components/ticket/QrTicketView.jsx` (Hiển thị QR vé & F&B order)
  - `components/common/Header.jsx`, `Footer.jsx`

---
*Lưu ý: Bảng danh sách này tập trung vào các file chính bắt buộc phải có để hệ thống hoạt động, ngoài ra sẽ có thêm các file utilities (`utils/`, `hooks/`, `exceptions/`) tuỳ thuộc vào tình hình thực tế khi triển khai code.*
