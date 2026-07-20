# 📅 Kế Hoạch Commit & Phát Triển 28 Ngày - CineBook

Dựa trên bảng phân chia công việc của dự án rạp chiếu phim **CineBook**, dưới đây là bản kế hoạch chi tiết chia thành 4 Sprints (mỗi Sprint 7 ngày). Kế hoạch này dùng làm guideline để commit code lên GitHub và theo dõi tiến độ hàng ngày.

---

## 🚀 Sprint 1: Nền tảng & Quản lý cơ bản (Ngày 1 - 7)
**Mục tiêu**: Hoàn thiện bộ khung Xác thực, Quản lý tài khoản và thiết lập cơ sở dữ liệu cho Phim, Rạp.

### 🧑‍💻 Trung (Auth & User Base)
- **Ngày 1-2**: Cài đặt Database schema Auth. Code luồng `Register` (Khách đăng ký qua OTP).
- **Ngày 3-4**: Code `Login` (Email/Password) & `User Logout` (Xử lý JWT/Token).
- **Ngày 5**: Thực hiện `Forgot Password / Reset Password`.
- **Ngày 6-7**: `Change Password` & `Edit Profile` (Tất cả vai trò).

### 🧑‍💻 Vinh (Movie Management Base)
- **Ngày 1-2**: Cài đặt Database schema Movie. Thiết lập API khung.
- **Ngày 3-4**: Frontend: `Movie List` (Browse & Filter) cho Admin/Guest.
- **Ngày 5-6**: `Movie Detail` (Kèm Trailer, Reviews) & `Add New Movie` (Có upload poster).
- **Ngày 7**: Giao diện & API `Edit / Update Movie`.

### 🧑‍💻 Hiếu (Cinema & Room Management)
- **Ngày 1-2**: Database schema cho Cinema và Room. Code API `Cinema List`.
- **Ngày 3-4**: Giao diện & API `Add / Edit Cinema`.
- **Ngày 5-6**: Thiết lập `Room Management` & `Seat Layout Config` (Xây dựng cấu trúc data lưu 2D Array ghế).
- **Ngày 7**: Cấu hình cơ bản Admin: `Adjust Seat Pricing` (Hệ số VIP/Couple).

### 🧑‍💻 Tuấn Anh (Customer Core UI)
- **Ngày 1-2**: Khởi tạo layout web Guest/Customer, thiết lập routing và theme (Header, Footer, Banner).
- **Ngày 3-4**: Code `Home Page` & Tích hợp `Movie List (Search & Browse)`.
- **Ngày 5-6**: Giao diện `Movie Detail` phía Guest (chuẩn bị nút Booking).
- **Ngày 7**: Thiết kế và tạo trước các UI Components sẽ dùng cho luồng Booking.

---

## 🛠 Sprint 2: Lịch chiếu & Setup Đặt vé (Ngày 8 - 14)
**Mục tiêu**: Quản trị người dùng toàn diện, thiết lập logic lịch chiếu và bắt đầu bước 1 của Booking.

### 🧑‍💻 Trung (Quản lý Người dùng)
- **Ngày 8-9**: Xây dựng `User List` (Admin xem phân trang).
- **Ngày 10-11**: `User Detail` & Các action `Lock User` / Đổi quyền.
- **Ngày 12**: Thêm tính năng Admin `Create Schedule Manager Account` (Không cần OTP).
- **Ngày 13**: Cập nhật `Update Location / Delivery Address` (Customer Profile).
- **Ngày 14**: System Config: Code logic `Ticket Hold Time`.

### 🧑‍💻 Vinh (F&B & Khuyến mãi)
- **Ngày 8-9**: Chức năng `Set Movie Public Status` & `Delete Movie` (Soft Delete).
- **Ngày 10-11**: `F&B Product Management` (Admin thêm/sửa đồ ăn, combo).
- **Ngày 12-13**: `Promo Code Management` (Tạo, xoá, áp dụng đk giảm giá).
- **Ngày 14**: Khởi tạo giao diện tĩnh `Admin Dashboard (KPIs)`.

### 🧑‍💻 Hiếu (Schedule Management Core)
- **Ngày 8-9**: Xây dựng `Schedule View` (Tháng/Tuần/Năm cho Admin).
- **Ngày 10-11**: Logic `Create Showtime` & Tích hợp `Conflict Check` tự động.
- **Ngày 12-13**: Giao diện `Showtime Schedule View` & `Seat Availability View` (Guest xem suất và số ghế trống).
- **Ngày 14**: Unit Test cho logic check trùng lịch chiếu.

### 🧑‍💻 Tuấn Anh (Booking Flow - Part 1)
- **Ngày 8-10**: Hoàn thành bước 1: `Select Cinema → Movie → Showtime`.
- **Ngày 11-13**: Code UI/UX cho `Seat Map / Seat Selection` (Tối đa 8 ghế, phân biệt VIP/Couple).
- **Ngày 14**: Kết nối API lấy trạng thái ghế từ DB.

---

## 🎟 Sprint 3: Luồng Đặt Vé Core & Vận hành (Ngày 15 - 21)
**Mục tiêu**: Hoàn thành toàn bộ luồng thanh toán Booking và Tính năng Báo cáo - Lịch chiếu nâng cao.

### 🧑‍💻 Trung (System Reports)
- **Ngày 15-17**: Chuẩn bị query, Store Procedures tính doanh thu, thống kê.
- **Ngày 18-20**: Hoàn thiện UI/API `Report Dashboard` (Thống kê theo biểu đồ, lọc phim/rạp).
- **Ngày 21**: Fix bug truy vấn và tối ưu báo cáo.

### 🧑‍💻 Vinh (P2P Ticket Exchange Base)
- **Ngày 15-16**: Thiết kế DB Sàn trao đổi vé (P2P). Tích hợp query data lên UI.
- **Ngày 17-18**: Code tính năng `Browse Ticket Exchange Community`.
- **Ngày 19-20**: Chức năng `List Ticket for Exchange / Pass` (Đăng vé) & `Cancel / Delist`.
- **Ngày 21**: Chức năng `Edit / Delete Resale Listing`.

### 🧑‍💻 Hiếu (Hoàn thiện Schedule & Map)
- **Ngày 15-16**: Thêm tính năng `Edit Showtime` & `Cancel Showtime` (Condition: chưa có vé).
- **Ngày 17-18**: Xây dựng `Schedule Manager Dashboard` (KPIs tỷ lệ lấp đầy).
- **Ngày 19-20**: Tích hợp `Cinema Map` (Google Maps API cho rạp).
- **Ngày 21**: Cross-test Lịch chiếu & Fix bug.

### 🧑‍💻 Tuấn Anh (Thanh toán & Hóa đơn)
- **Ngày 15-16**: Bước Booking 2: `Select F&B Combo`.
- **Ngày 17-18**: Bước Booking 3: `Apply Promo Code` & Update Total Price.
- **Ngày 19-20**: Hoàn thiện `Payment Page` (Tích hợp MoMo/VNPay Test Sandbox).
- **Ngày 21**: Generate & Email `QR Ticket` sau khi thanh toán thành công.

---

## 🎯 Sprint 4: Đánh bóng, Fix Bug & Go Live (Ngày 22 - 28)
**Mục tiêu**: Hoàn thiện End-to-End Test, Sàn P2P, Báo cáo Excel và Chuẩn bị Release.

### 🧑‍💻 Trung (Finalize Admin & Auth)
- **Ngày 22-23**: Thêm tính năng `Export Excel (Reports)` cho Dashboard.
- **Ngày 24-25**: Audits Security toàn hệ thống: Rate limit auth, Test Role/Permission API.
- **Ngày 26-28**: Hỗ trợ UAT, Fix các bug liên quan Auth & System Reports.

### 🧑‍💻 Vinh (P2P Admin & Đánh giá)
- **Ngày 22**: Tính năng `Contact Ticket Owner / View Contact Info`.
- **Ngày 23-24**: Admin Resale Mgmt: `Manage Resale Listings` & Ẩn vé vi phạm.
- **Ngày 25-26**: Admin Resale Mgmt: `View Resale Listing Report`.
- **Ngày 27-28**: Tích hợp data vào `Admin Dashboard (KPIs)` & Bug fixing.

### 🧑‍💻 Hiếu (Tối ưu Lịch chiếu & Ghế)
- **Ngày 22-24**: Phối hợp cùng Tuấn Anh xử lý logic Lock/Release ghế tự động theo `Ticket Hold Time`.
- **Ngày 25-26**: UAT toàn bộ luồng Conflict Lịch chiếu.
- **Ngày 27-28**: Tối ưu DB Indexes cho Bảng Lịch chiếu & Hoàn thiện docs.

### 🧑‍💻 Tuấn Anh (Trải nghiệm Khách hàng Cuối)
- **Ngày 22**: Xây dựng `Booking History` & `View / Download QR Ticket`.
- **Ngày 23**: Thêm tính năng `View Concession Order QR`.
- **Ngày 24-25**: Tính năng `Write Review & Rate Movie`.
- **Ngày 26-28**: Test End-to-End toàn bộ luồng đặt vé. Sửa lỗi Responsive Mobile & Animations.

---

## 💡 Hướng dẫn áp dụng vào GitHub
1. **Repository / Projects Board**: Dựa vào kế hoạch trên, tạo 4 Milestones (Sprint 1 đến 4).
2. **Issues**: Tạo GitHub Issues cho từng task nhỏ. Assign đúng người (Trung, Vinh, Hiếu, Tuấn Anh).
3. **Branching Strategy**: 
   - `main`: Code ổn định.
   - `develop`: Nơi merge các features hàng ngày.
   - `<tên-người>/<tên-tính-năng>` (VD: `trung/feature-auth-login`): Branch phát triển.
4. **Pull Requests (PR)**: Yêu cầu review chéo trước khi merge (Tối thiểu 1 approval).
5. **Standup Hàng Ngày**: Kiểm tra tiến độ mỗi ngày theo check-list trên để đảm bảo đúng deadline.
