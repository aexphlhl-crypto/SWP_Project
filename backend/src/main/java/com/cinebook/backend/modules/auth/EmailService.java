package com.cinebook.backend.modules.auth;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Async
    public void sendVerificationOtp(String to, String otp) {
        String subject = "CineBook - Verify Your Email";
        String content = "<h1>Welcome to CineBook!</h1>"
                + "<p>Your email verification OTP is: <strong>" + otp + "</strong></p>"
                + "<p>This OTP will expire in 10 minutes.</p>";
        sendHtmlEmail(to, subject, content);
    }

    @Async
    public void sendResetPasswordOtp(String to, String otp) {
        String subject = "CineBook - Reset Your Password";
        String content = "<h1>Reset Your Password</h1>"
                + "<p>Your password reset OTP is: <strong>" + otp + "</strong></p>"
                + "<p>This OTP will expire in 5 minutes.</p>";
        sendHtmlEmail(to, subject, content);
    }

    @Async
    public void sendTempPassword(String to, String tempPassword) {
        String subject = "CineBook - Temporary Password";
        String content = "<h1>Password Reset</h1>"
                + "<p>Your temporary password is: <strong>" + tempPassword + "</strong></p>"
                + "<p>Please login and change your password immediately.</p>";
        sendHtmlEmail(to, subject, content);
    }

    public void sendManagerCredentials(String to, String fullName, String tempPassword) {
        String subject = "CineBook - Thông tin tài khoản Schedule Manager";
        String content = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;'>"
                + "<h2 style='color:#e50914;'>Chào mừng đến với CineBook!</h2>"
                + "<p>Xin chào <strong>" + fullName + "</strong>,</p>"
                + "<p>Tài khoản Schedule Manager của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập:</p>"
                + "<div style='background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;'>"
                + "<p style='margin:4px 0;'><strong>Email:</strong> " + to + "</p>"
                + "<p style='margin:4px 0;'><strong>Mật khẩu tạm thời:</strong> <code style='background:#e0e0e0;padding:2px 6px;border-radius:4px;'>" + tempPassword + "</code></p>"
                + "</div>"
                + "<p style='color:#e53e3e;'>Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu.</p>"
                + "<p>Trân trọng,<br/>Đội ngũ CineBook</p>"
                + "</div>";
        sendHtmlEmail(to, subject, content);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            if (senderEmail == null || senderEmail.isEmpty()) {
                log.warn("Email sending skipped: MAIL_USERNAME is not configured.");
                return;
            }
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}", to, e);
        }
    }

    @Async
    public void sendBookingConfirmation(String to, com.cinebook.backend.modules.bookings.dto.MyBookingDto booking) {
        String subject = "CineBook - Booking Confirmation #" + booking.getId();
        
        StringBuilder content = new StringBuilder();
        content.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>");
        content.append("<h2 style='color: #4CAF50;'>Đặt vé thành công!</h2>");
        content.append("<p>Cảm ơn bạn đã đặt vé tại CineBook. Dưới đây là thông tin vé của bạn:</p>");
        
        content.append("<table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>");
        content.append("<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Mã đặt vé:</strong></td><td style='padding: 8px; border: 1px solid #ddd;'>").append(booking.getId()).append("</td></tr>");
        content.append("<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Phim:</strong></td><td style='padding: 8px; border: 1px solid #ddd;'>").append(booking.getMovieTitle()).append("</td></tr>");
        content.append("<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Rạp:</strong></td><td style='padding: 8px; border: 1px solid #ddd;'>").append(booking.getCinemaName()).append("</td></tr>");
        content.append("<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Phòng chiếu:</strong></td><td style='padding: 8px; border: 1px solid #ddd;'>").append(booking.getRoomName()).append("</td></tr>");
        content.append("<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Ngày chiếu:</strong></td><td style='padding: 8px; border: 1px solid #ddd;'>").append(booking.getShowDate()).append("</td></tr>");
        content.append("<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Giờ chiếu:</strong></td><td style='padding: 8px; border: 1px solid #ddd;'>").append(booking.getShowTime()).append("</td></tr>");
        content.append("<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Ghế:</strong></td><td style='padding: 8px; border: 1px solid #ddd;'>").append(booking.getSeatNumber()).append("</td></tr>");
        content.append("<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Tổng tiền:</strong></td><td style='padding: 8px; border: 1px solid #ddd;'>").append(String.format("%,d VND", booking.getTotalAmount())).append("</td></tr>");
        content.append("</table>");

        if (booking.getFnbItems() != null && !booking.getFnbItems().isEmpty()) {
            content.append("<h3 style='margin-top: 20px;'>Bắp nước (F&B)</h3><ul>");
            for (com.cinebook.backend.modules.bookings.dto.FnBItemDto item : booking.getFnbItems()) {
                content.append("<li>").append(item.getProductName()).append(" (x").append(item.getQuantity()).append(")</li>");
            }
            content.append("</ul>");
        }

        content.append("<h3 style='margin-top: 30px; text-align: center;'>Vé điện tử (QR Code)</h3>");
        content.append("<p style='text-align: center; color: #666; font-size: 12px;'>Vui lòng xuất trình các mã QR dưới đây tại quầy kiểm soát vé hoặc quầy bắp nước.</p>");
        
        content.append("<div style='text-align: center;'>");
        if (booking.getTickets() != null) {
            for (com.cinebook.backend.modules.bookings.dto.TicketDto ticket : booking.getTickets()) {
                String encodedQr = "";
                try {
                    encodedQr = java.net.URLEncoder.encode(ticket.getQrCodeValue(), java.nio.charset.StandardCharsets.UTF_8.toString());
                } catch (Exception e) {
                    encodedQr = ticket.getTicketCode();
                }
                String qrUrl = "https://quickchart.io/qr?text=" + encodedQr + "&size=150";
                content.append("<div style='display: inline-block; margin: 10px; padding: 15px; border: 1px solid #eee; border-radius: 8px;'>");
                content.append("<img src='").append(qrUrl).append("' alt='QR Code' />");
                content.append("<p style='margin: 10px 0 0 0; font-family: monospace; font-weight: bold;'>").append(ticket.getTicketCode()).append("</p>");
                String label = "FNB".equals(ticket.getSeatType()) ? "Bắp nước" : "Ghế " + ticket.getSeatLabel();
                content.append("<p style='margin: 5px 0 0 0; font-size: 14px; color: #555;'>").append(label).append("</p>");
                content.append("</div>");
            }
        }
        content.append("</div>");
        
        content.append("<hr style='margin-top: 30px; border: 0; border-top: 1px solid #eee;' />");
        content.append("<p style='text-align: center; font-size: 12px; color: #999;'>Đây là email tự động. Vui lòng không trả lời email này.</p>");
        content.append("</div>");

        sendHtmlEmail(to, subject, content.toString());
    }
}
