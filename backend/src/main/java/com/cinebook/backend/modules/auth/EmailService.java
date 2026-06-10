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
}
