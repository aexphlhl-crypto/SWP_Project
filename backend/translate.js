const fs = require('fs');
const path = require('path');

const dict = {
  "Incorrect email or password. Please check again.": "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
  "You do not have permission to access this resource.": "Bạn không có quyền truy cập vào tài nguyên này.",
  "A record with this value already exists. Please check for duplicates.": "Bản ghi với giá trị này đã tồn tại. Vui lòng kiểm tra trùng lặp.",
  "No pending registration found for this email.": "Không tìm thấy yêu cầu đăng ký nào đang chờ xử lý cho email này.",
  "OTP has expired. Please register again.": "Mã OTP đã hết hạn. Vui lòng đăng ký lại.",
  "Too many OTP attempts. Please register again.": "Đã quá số lần thử OTP. Vui lòng đăng ký lại.",
  "Incorrect OTP. \" + (MAX_OTP_RETRIES - pendingUser.getOtpRetryCount()) + \" attempts remaining.": "Mã OTP không chính xác. Còn lại \" + (MAX_OTP_RETRIES - pendingUser.getOtpRetryCount()) + \" lần thử.",
  "Account is temporarily locked due to multiple failed attempts. Please try again later.": "Tài khoản tạm thời bị khóa do sai quá nhiều lần. Vui lòng thử lại sau.",
  "Email not verified. Please verify your email first.": "Email chưa được xác thực. Vui lòng xác thực email của bạn trước.",
  "Account is locked. Please contact support.": "Tài khoản đã bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.",
  "Account locked for 30 minutes due to 5 failed login attempts.": "Tài khoản bị khóa 30 phút do nhập sai mật khẩu 5 lần.",
  "Invalid or expired refresh token.": "Token không hợp lệ hoặc đã hết hạn.",
  "Refresh token expired. Please login again.": "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  "No account found with this email address.": "Không tìm thấy tài khoản nào với địa chỉ email này.",
  "OTP not found or already used. Please request a new one.": "Mã OTP không tồn tại hoặc đã được sử dụng. Vui lòng yêu cầu mã mới.",
  "OTP has expired. Please request a new one.": "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.",
  "Too many OTP attempts. Please request a new one.": "Đã quá số lần thử OTP. Vui lòng yêu cầu mã mới.",
  "Incorrect OTP. \" + (MAX_OTP_RETRIES - otpToken.getRetryCount()) + \" attempts remaining.": "Mã OTP không chính xác. Còn lại \" + (MAX_OTP_RETRIES - otpToken.getRetryCount()) + \" lần thử.",
  "Reset token is invalid or has expired.": "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
  "Reset token is invalid.": "Mã đặt lại mật khẩu không hợp lệ.",
  "User not found.": "Không tìm thấy người dùng.",
  "Current password is incorrect.": "Mật khẩu hiện tại không chính xác.",
  "New password must not be the same as the current password.": "Mật khẩu mới không được trùng với mật khẩu hiện tại.",
  "Invalid Google ID token.": "Token xác thực Google không hợp lệ.",
  "Showtime not found.": "Không tìm thấy suất chiếu.",
  "Customer not found.": "Không tìm thấy khách hàng.",
  "Booking not found.": "Không tìm thấy đơn hàng.",
  "You are not authorized to cancel this booking.": "Bạn không có quyền hủy đơn hàng này.",
  "Only pending bookings can be cancelled.": "Chỉ những đơn hàng đang chờ xử lý mới có thể bị hủy.",
  "Genre not found.": "Không tìm thấy thể loại.",
  "Promo code not found.": "Không tìm thấy mã khuyến mãi.",
  "Promo code is inactive.": "Mã khuyến mãi đang không hoạt động.",
  "Promo code has expired or is not yet valid.": "Mã khuyến mãi đã hết hạn hoặc chưa có hiệu lực.",
  "Order total does not meet the minimum required amount of \" + promo.getMinOrderValue() + \" VND.": "Giá trị đơn hàng không đạt mức tối thiểu \" + promo.getMinOrderValue() + \" VNĐ để áp dụng mã.",
  "Promo code usage limit has been reached.": "Mã khuyến mãi đã hết lượt sử dụng.",
  "You have already used this promo code.": "Bạn đã sử dụng mã khuyến mãi này rồi.",
  "Cannot delete an active promo code. Please deactivate it first.": "Không thể xóa mã khuyến mãi đang hoạt động. Vui lòng vô hiệu hóa trước.",
  "Booking not found": "Không tìm thấy đơn hàng",
  "You do not own this booking": "Bạn không phải chủ sở hữu của đơn hàng này",
  "Ticket listing is not allowed less than 2 hours before the showtime starts.": "Không được phép bán lại vé khi chỉ còn chưa đầy 2 giờ trước giờ chiếu.",
  "FNB is already included in another active listing.": "Đồ ăn/nước uống này đã được đăng bán trong một tin khác.",
  "Seat \" + rs + \" is already listed.": "Ghế \" + rs + \" đã được đăng bán.",
  "Listing not found": "Không tìm thấy tin bán vé",
  "You are not authorized to review this booking.": "Bạn không có quyền đánh giá đơn đặt vé này.",
  "The showtime has not ended yet. You can review after it finishes.": "Suất chiếu chưa kết thúc. Bạn chỉ có thể đánh giá sau khi suất chiếu hoàn tất.",
  "Movie not found.": "Không tìm thấy phim.",
  "No review found for this booking.": "Không tìm thấy đánh giá nào cho đơn đặt vé này.",
  "Review not found.": "Không tìm thấy đánh giá.",
  "User not found": "Không tìm thấy người dùng",
  "Room not found.": "Không tìm thấy phòng chiếu.",
  "You do not have permission to manage rooms for this cinema.": "Bạn không có quyền quản lý phòng chiếu của rạp này.",
  "Cinema not found.": "Không tìm thấy rạp chiếu phim.",
  "Seat layout can only be configured when the room is Under Maintenance or Inactive.": "Sơ đồ ghế chỉ có thể cấu hình khi phòng chiếu đang bảo trì hoặc ngừng hoạt động.",
  "Cannot remove seats that have active bookings or holds.": "Không thể xóa các ghế đang được giữ hoặc đã có người đặt.",
  "Seat not found.": "Không tìm thấy ghế.",
  "This seat has already been booked by another customer.": "Ghế này đã được khách hàng khác đặt.",
  "This seat is currently held by another customer.": "Ghế này hiện đang được giữ bởi khách hàng khác.",
  "Cannot create showtime for a hidden movie.": "Không thể tạo suất chiếu cho phim đang ẩn.",
  "Cannot create showtime in a room under maintenance.": "Không thể tạo suất chiếu trong phòng đang bảo trì.",
  "Start time is required.": "Thời gian bắt đầu là bắt buộc.",
  "Cannot create a showtime in the past.": "Không thể tạo suất chiếu trong quá khứ.",
  "Conflict Detected — Minimum cleanup gap of 20 minutes violated.": "Xung đột lịch chiếu - Thời gian dọn dẹp tối thiểu 20 phút không được đảm bảo.",
  "Cannot edit a showtime that already has sold tickets.": "Không thể chỉnh sửa suất chiếu đã có vé được bán.",
  "Cannot update showtime to a hidden movie.": "Không thể cập nhật suất chiếu sang một phim đang ẩn.",
  "Cannot update showtime to a room under maintenance.": "Không thể cập nhật suất chiếu sang phòng đang bảo trì.",
  "Cannot update a showtime to a time in the past.": "Không thể cập nhật suất chiếu về một thời điểm trong quá khứ.",
  "Cannot cancel a showtime that already has sold tickets.": "Không thể hủy suất chiếu đã có vé được bán.",
  "You do not have permission to manage showtimes for this cinema.": "Bạn không có quyền quản lý suất chiếu của rạp này.",
  "File is empty": "Tệp trống",
  "Email already exists": "Email đã tồn tại",
  "Cinema ID is required": "ID rạp chiếu phim là bắt buộc",
  "Cinema not found": "Không tìm thấy rạp chiếu phim",
  "Manager not found": "Không tìm thấy quản lý",
  "Can only delete managers": "Chỉ có thể xóa tài khoản quản lý"
};

let filesChanged = 0;

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.java')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let originalContent = content;
            
            for (const [eng, vie] of Object.entries(dict)) {
                // simple string replacement for literal quoted strings
                content = content.replace(`"${eng}"`, `"${vie}"`);
            }
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf-8');
                filesChanged++;
                console.log(`Updated ${file}`);
            }
        }
    }
}

walkDir(path.join(__dirname, 'src'));
console.log(`Completed. Updated ${filesChanged} files.`);
