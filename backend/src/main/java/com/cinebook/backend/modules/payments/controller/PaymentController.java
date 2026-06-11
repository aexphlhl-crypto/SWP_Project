package com.cinebook.backend.modules.payments.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.bookings.entity.Booking;
import com.cinebook.backend.modules.bookings.entity.BookingStatus;
import com.cinebook.backend.modules.bookings.repository.BookingRepository;
import com.cinebook.backend.modules.payments.entity.Payment;
import com.cinebook.backend.modules.payments.entity.PaymentMethod;
import com.cinebook.backend.modules.payments.entity.PaymentStatus;
import com.cinebook.backend.modules.payments.repository.PaymentRepository;
import com.cinebook.backend.modules.payments.service.VNPayService;
import com.cinebook.backend.modules.notifications.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @PostMapping("/create-url")
    @PreAuthorize("hasRole('Customer')")
    public ResponseEntity<ApiResponse<String>> createUrl(@RequestParam Long bookingId, HttpServletRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.Pending) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Booking is not in pending state", "INVALID_STATE"));
        }

        String ipAddr = getClientIp(request);
        String paymentUrl = vnPayService.createPaymentUrl(booking, ipAddr);
        
        // Extract txn ref to save in payment
        String[] urlParts = paymentUrl.split("\\?");
        String vnpTxnRef = "";
        if (urlParts.length > 1) {
            String[] params = urlParts[1].split("&");
            for (String param : params) {
                if (param.startsWith("vnp_TxnRef=")) {
                    vnpTxnRef = param.split("=")[1];
                    break;
                }
            }
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setPaymentMethod(PaymentMethod.VNPay);
        payment.setGatewayTxnId(vnpTxnRef);
        payment.setAmount(booking.getTotalAfterTax());
        payment.setStatus(PaymentStatus.Pending);
        paymentRepository.save(payment);

        return ResponseEntity.ok(ApiResponse.ok(paymentUrl));
    }

    @GetMapping("/vnpay-return")
    public void vnPayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, String> fields = new HashMap<>();
        for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
            fields.put(entry.getKey(), entry.getValue()[0]);
        }

        String vnpTxnRef = fields.get("vnp_TxnRef");
        String vnpResponseCode = fields.get("vnp_ResponseCode");
        String bookingIdStr = vnpTxnRef != null && vnpTxnRef.contains("_") ? vnpTxnRef.split("_")[0] : vnpTxnRef;

        boolean isValid = vnPayService.verifySignature(fields);
        if (!isValid) {
            response.sendRedirect(frontendUrl + "/payment/result?status=error&code=INVALID_SIGNATURE");
            return;
        }

        try {
            Payment payment = paymentRepository.findByGatewayTxnId(vnpTxnRef)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            if (payment.getStatus() != PaymentStatus.Success) {
                if ("00".equals(vnpResponseCode)) {
                    payment.setStatus(PaymentStatus.Success);
                    payment.setPaidAt(LocalDateTime.now());

                    Booking booking = payment.getBooking();
                    booking.setStatus(BookingStatus.Confirmed);
                    bookingRepository.save(booking);

                    // Trigger notification
                    String notificationTitle = "Thanh toán thành công";
                    String notificationMessage = String.format("Thanh toán thành công cho đơn vé xem phim %s. Mã đặt vé: BK%03d. Cảm ơn bạn đã sử dụng dịch vụ!",
                            booking.getShowtime().getMovie().getTitle(), booking.getId());
                    notificationService.createNotification(booking.getCustomer().getUserId(), notificationTitle, notificationMessage);
                } else {
                    payment.setStatus(PaymentStatus.Failed);
                    Booking booking = payment.getBooking();
                    booking.setStatus(BookingStatus.Failed);
                    bookingRepository.save(booking);
                }
                paymentRepository.save(payment);
            }

            if ("00".equals(vnpResponseCode)) {
                response.sendRedirect(frontendUrl + "/payment/result?status=success&bookingId=" + bookingIdStr + "&txnRef=" + vnpTxnRef);
            } else {
                response.sendRedirect(frontendUrl + "/payment/result?status=failed&code=" + vnpResponseCode + "&bookingId=" + bookingIdStr);
            }
        } catch (Exception e) {
            response.sendRedirect(frontendUrl + "/payment/result?status=error&code=SERVER_ERROR");
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if ("0:0:0:0:0:0:0:1".equals(ip) || "[0:0:0:0:0:0:0:1]".equals(ip)) {
            ip = "127.0.0.1";
        }
        return ip;
    }
}
