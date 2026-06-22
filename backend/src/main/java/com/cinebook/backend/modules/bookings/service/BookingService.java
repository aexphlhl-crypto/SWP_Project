package com.cinebook.backend.modules.bookings.service;

import com.cinebook.backend.modules.bookings.entity.Booking;
import com.cinebook.backend.modules.bookings.entity.BookingSeat;
import com.cinebook.backend.modules.bookings.entity.BookingStatus;
import com.cinebook.backend.modules.bookings.repository.BookingRepository;
import com.cinebook.backend.modules.bookings.repository.BookingSeatRepository;
import com.cinebook.backend.modules.config.service.SystemConfigService;
import com.cinebook.backend.modules.rooms.entity.Room;
import com.cinebook.backend.modules.rooms.entity.Seat;
import com.cinebook.backend.modules.rooms.entity.SeatType;
import com.cinebook.backend.modules.rooms.repository.SeatRepository;
import com.cinebook.backend.modules.showtimes.entity.Showtime;
import com.cinebook.backend.modules.showtimes.repository.ShowtimeRepository;
import com.cinebook.backend.modules.users.User;
import com.cinebook.backend.modules.users.UserRepository;
import com.cinebook.backend.modules.bookings.entity.FnBOrderItem;
import com.cinebook.backend.modules.bookings.repository.FnBOrderItemRepository;
import com.cinebook.backend.modules.fnb.entity.FnBProduct;
import com.cinebook.backend.modules.fnb.repository.FnBProductRepository;
import com.cinebook.backend.modules.bookings.dto.FnBItemRequest;
import com.cinebook.backend.modules.bookings.dto.FnBItemDto;
import com.cinebook.backend.modules.promos.repository.PromoCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final SystemConfigService systemConfigService;
    private final FnBOrderItemRepository fnbOrderItemRepository;
    private final FnBProductRepository fnbProductRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final com.cinebook.backend.modules.promos.service.PromoService promoService;

    @Transactional
    public Booking createBooking(Long customerId, Long showtimeId, List<Long> seatIds, List<FnBItemRequest> fnbItems, String promoCode) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
                
        Room room = showtime.getRoom();

        BigDecimal vipMultiplier = systemConfigService.getSeatVipMultiplier();
        BigDecimal coupleMultiplier = systemConfigService.getSeatCoupleMultiplier();
        BigDecimal vatRate = systemConfigService.getVatRate();
        int holdMinutes = systemConfigService.getSeatHoldMinutes();

        int totalBeforeTax = 0;
        List<BookingSeat> bookingSeats = new ArrayList<>();

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setShowtime(showtime);
        booking.setStatus(BookingStatus.Pending);
        booking.setHoldExpiresAt(LocalDateTime.now().plusMinutes(holdMinutes));
        booking.setVatRateSnapshot(vatRate);

        // Save early to get ID for booking seats
        booking = bookingRepository.save(booking);

        for (Long seatId : seatIds) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new RuntimeException("Seat not found: " + seatId));
            
            int seatPrice;
            BigDecimal basePrice = systemConfigService.getBasePrice();
            
            // Seat type multiplier
            BigDecimal seatMultiplier = BigDecimal.ONE;
            if (seat.getSeatType() == SeatType.VIP) {
                seatMultiplier = vipMultiplier;
            } else if (seat.getSeatType() == SeatType.Couple) {
                seatMultiplier = coupleMultiplier;
            }

            // Day-of-week multiplier (weekend surcharge)
            BigDecimal dayMultiplier = BigDecimal.ONE;
            java.time.DayOfWeek day = showtime.getStartTime().getDayOfWeek();
            if (day == java.time.DayOfWeek.SATURDAY || day == java.time.DayOfWeek.SUNDAY) {
                BigDecimal weekendSurcharge = systemConfigService.getWeekendSurchargePercent()
                        .divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);
                dayMultiplier = BigDecimal.ONE.add(weekendSurcharge);
            }
            
            // Time-of-day multiplier (evening surcharge)
            BigDecimal timeMultiplier = BigDecimal.ONE;
            try {
                String eveningTimeStr = systemConfigService.getEveningSurchargeTime();
                if (eveningTimeStr != null && eveningTimeStr.contains(":")) {
                    java.time.LocalTime eveningTime = java.time.LocalTime.parse(eveningTimeStr);
                    if (!showtime.getStartTime().toLocalTime().isBefore(eveningTime)) {
                        BigDecimal eveningSurcharge = systemConfigService.getEveningSurchargePercent()
                                .divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);
                        timeMultiplier = BigDecimal.ONE.add(eveningSurcharge);
                    }
                }
            } catch (Exception e) { /* use default timeMultiplier = 1 */ }
            
            seatPrice = basePrice
                .multiply(seatMultiplier)
                .multiply(dayMultiplier)
                .multiply(timeMultiplier)
                .intValue();

            totalBeforeTax += seatPrice;

            BookingSeat bookingSeat = new BookingSeat();
            bookingSeat.setBooking(booking);
            bookingSeat.setSeat(seat);
            bookingSeat.setSeatType(seat.getSeatType());
            bookingSeat.setPriceAtBooking(seatPrice);
            bookingSeats.add(bookingSeat);
        }

        bookingSeatRepository.saveAll(bookingSeats);

        int vatAmount = BigDecimal.valueOf(totalBeforeTax).multiply(vatRate).setScale(0, RoundingMode.HALF_UP).intValue();
        int totalAfterTax = totalBeforeTax + vatAmount;

        booking.setTotalTicketsAmount(totalBeforeTax);
        booking.setSubTotal(totalBeforeTax); // Base subtotal (tickets)
        booking.setTotalBeforeTax(totalBeforeTax);
        booking.setVatAmount(vatAmount);
        booking.setTotalAfterTax(totalAfterTax);

        Booking savedBooking = bookingRepository.save(booking);

        int totalFnbAmount = 0;
        if (fnbItems != null && !fnbItems.isEmpty()) {
            List<FnBOrderItem> fnbOrderItems = new ArrayList<>();
            for (FnBItemRequest fnbReq : fnbItems) {
                FnBProduct product = fnbProductRepository.findById(fnbReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + fnbReq.getProductId()));
                
                FnBOrderItem fnbOrderItem = new FnBOrderItem();
                fnbOrderItem.setBookingId(savedBooking.getId());
                fnbOrderItem.setProduct(product);
                fnbOrderItem.setQuantity(fnbReq.getQuantity());
                fnbOrderItem.setUnitPrice(product.getPrice());
                fnbOrderItems.add(fnbOrderItem);

                totalFnbAmount += (product.getPrice() * fnbReq.getQuantity());
            }
            fnbOrderItemRepository.saveAll(fnbOrderItems);
            
            // Re-calculate totals with F&B included
            int newTotalBeforeTax = totalBeforeTax + totalFnbAmount;
            int newVatAmount = BigDecimal.valueOf(newTotalBeforeTax).multiply(vatRate).setScale(0, RoundingMode.HALF_UP).intValue();
            int newTotalAfterTax = newTotalBeforeTax + newVatAmount;
            
            savedBooking.setTotalFnbAmount(totalFnbAmount);
            savedBooking.setSubTotal(newTotalBeforeTax);
            savedBooking.setTotalBeforeTax(newTotalBeforeTax);
            savedBooking.setVatAmount(newVatAmount);
            savedBooking.setTotalAfterTax(newTotalAfterTax);
            savedBooking = bookingRepository.save(savedBooking);
        }

        if (promoCode != null && !promoCode.isEmpty()) {
            try {
                com.cinebook.backend.modules.promos.entity.PromoCode promo = promoService.validateAndReservePromo(promoCode, customerId, savedBooking.getId(), savedBooking.getTotalBeforeTax());
                int discountAmount = 0;
                if (promo.getDiscountType() == com.cinebook.backend.modules.promos.entity.PromoDiscountType.Percentage) {
                    discountAmount = savedBooking.getTotalBeforeTax() * promo.getDiscountValue().intValue() / 100;
                    if (promo.getMaxDiscountVnd() != null && discountAmount > promo.getMaxDiscountVnd()) {
                        discountAmount = promo.getMaxDiscountVnd();
                    }
                } else {
                    discountAmount = promo.getDiscountValue().intValue();
                }
                
                int newTotalBeforeTax = savedBooking.getTotalBeforeTax() - discountAmount;
                if (newTotalBeforeTax < 0) newTotalBeforeTax = 0;
                int newVatAmount = java.math.BigDecimal.valueOf(newTotalBeforeTax).multiply(vatRate).setScale(0, java.math.RoundingMode.HALF_UP).intValue();
                int newTotalAfterTax = newTotalBeforeTax + newVatAmount;

                savedBooking.setPromoId(promo.getId());
                savedBooking.setDiscountAmount(discountAmount);
                savedBooking.setVatAmount(newVatAmount);
                savedBooking.setTotalAfterTax(newTotalAfterTax);
                savedBooking = bookingRepository.save(savedBooking);
            } catch (Exception e) {
                // If promo validation fails, we throw an exception to abort the booking
                throw new RuntimeException("Invalid promo code: " + e.getMessage());
            }
        }

        return savedBooking;
    }

    @Transactional
    public void cancelMyBooking(Long bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getCustomer().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized to cancel this booking");
        }
        
        if (booking.getStatus() != BookingStatus.Pending) {
            throw new RuntimeException("Only pending bookings can be cancelled");
        }
        
        booking.setStatus(BookingStatus.Cancelled);
        bookingRepository.save(booking);
        
        // Release promo
        if (booking.getPromoId() != null) {
            promoService.releasePromoUsage(booking.getPromoId(), booking.getId());
        }
        
        // Release seat holds
        com.cinebook.backend.modules.showtimes.repository.SeatHoldRepository seatHoldRepository = 
            org.springframework.web.context.support.WebApplicationContextUtils.getWebApplicationContext(
                org.springframework.web.context.request.RequestContextHolder.getRequestAttributes() != null ? 
                ((org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes()).getRequest().getServletContext() : null
            ).getBean(com.cinebook.backend.modules.showtimes.repository.SeatHoldRepository.class);
            
        seatHoldRepository.deleteByShowtimeAndUser(booking.getShowtime().getShowtimeId(), booking.getCustomer().getUserId());
    }

    public org.springframework.data.domain.Page<com.cinebook.backend.modules.bookings.dto.BookingAdminDto> getAllBookingsAdmin(org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<Booking> bookings;

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            boolean isScheduleManager = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ScheduleManager"));
            if (isScheduleManager) {
                String email = auth.getName();
                com.cinebook.backend.modules.users.User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                if (user.getCinema() != null) {
                    bookings = bookingRepository.findByShowtimeCinemaCinemaId(user.getCinema().getCinemaId(), pageable);
                } else {
                    return org.springframework.data.domain.Page.empty(pageable);
                }
            } else {
                bookings = bookingRepository.findAll(pageable);
            }
        } else {
            bookings = bookingRepository.findAll(pageable);
        }

        return bookings.map(booking -> {
            List<BookingSeat> seats = bookingSeatRepository.findByBooking_Id(booking.getId());
            String seatNames = seats.stream()
                    .map(s -> s.getSeat().getSeatLabel())
                    .collect(java.util.stream.Collectors.joining(", "));

            String movieTitle = booking.getShowtime().getMovie().getTitle();
            String cinemaName = booking.getShowtime().getRoom().getCinema().getName();
            String roomName = booking.getShowtime().getRoom().getName();
            String showtimeTime = booking.getShowtime().getStartTime().toLocalTime().toString();
            String customerName = booking.getCustomer().getFullName();
            String phone = booking.getCustomer().getPhone();

            return com.cinebook.backend.modules.bookings.dto.BookingAdminDto.builder()
                    .id("BK" + String.format("%03d", booking.getId()))
                    .movie(movieTitle)
                    .customer(customerName)
                    .phone(phone)
                    .cinema(cinemaName)
                    .room(roomName)
                    .showtime(showtimeTime)
                    .seats(seatNames)
                    .amount(booking.getTotalAfterTax())
                    .status(booking.getStatus())
                    .date(booking.getCreatedAt().toLocalDate().toString())
                    .build();
        });
    }

    public com.cinebook.backend.modules.bookings.dto.BookingAdminDto updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        booking = bookingRepository.save(booking);

        List<BookingSeat> seats = bookingSeatRepository.findByBooking_Id(booking.getId());
        String seatNames = seats.stream()
                .map(s -> s.getSeat().getSeatLabel())
                .collect(java.util.stream.Collectors.joining(", "));

        String movieTitle = booking.getShowtime().getMovie().getTitle();
        String cinemaName = booking.getShowtime().getRoom().getCinema().getName();
        String roomName = booking.getShowtime().getRoom().getName();
        String showtimeTime = booking.getShowtime().getStartTime().toLocalTime().toString();
        String customerName = booking.getCustomer().getFullName();
        String phone = booking.getCustomer().getPhone();

        return com.cinebook.backend.modules.bookings.dto.BookingAdminDto.builder()
                .id("BK" + String.format("%03d", booking.getId()))
                .movie(movieTitle)
                .customer(customerName)
                .phone(phone)
                .cinema(cinemaName)
                .room(roomName)
                .showtime(showtimeTime)
                .seats(seatNames)
                .amount(booking.getTotalAfterTax())
                .status(booking.getStatus())
                .date(booking.getCreatedAt().toLocalDate().toString())
                .build();
    }

    public List<com.cinebook.backend.modules.bookings.dto.MyBookingDto> getMyBookings(String email) {
        User customer = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        List<Booking> bookings = bookingRepository.findByCustomer_UserIdAndStatusInOrderByCreatedAtDesc(
                customer.getUserId(),
                java.util.List.of(BookingStatus.Confirmed, BookingStatus.CheckedIn, BookingStatus.Cancelled)
        );
        return bookings.stream().map(booking -> {
            List<BookingSeat> seats = bookingSeatRepository.findByBooking_Id(booking.getId());
            String seatNames = seats.stream()
                    .map(s -> s.getSeat().getSeatLabel())
                    .collect(java.util.stream.Collectors.joining(", "));

            List<FnBOrderItem> fnbOrderItems = fnbOrderItemRepository.findByBookingId(booking.getId());
            List<FnBItemDto> fnbItemDtos = fnbOrderItems.stream().map(item -> FnBItemDto.builder()
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .unitPrice(item.getUnitPrice())
                    .quantity(item.getQuantity())
                    .subtotal(item.getUnitPrice() * item.getQuantity())
                    .build()).collect(java.util.stream.Collectors.toList());

            String bookingCode = "BK" + String.format("%03d", booking.getId());
            List<com.cinebook.backend.modules.bookings.dto.TicketDto> ticketDtos = seats.stream().map(s -> com.cinebook.backend.modules.bookings.dto.TicketDto.builder()
                    .seatLabel(s.getSeat().getSeatLabel())
                    .seatType(s.getSeatType().name())
                    .price(s.getPriceAtBooking())
                    .ticketCode(bookingCode + "-" + s.getSeat().getSeatLabel())
                    .qrCodeValue(String.format("Mã vé: %s-%s\nPhim: %s\nRạp: %s\nPhòng: %s\nSuất chiếu: %s %s\nGhế: %s",
                            bookingCode, s.getSeat().getSeatLabel(),
                            booking.getShowtime().getMovie().getTitle(),
                            booking.getShowtime().getRoom().getCinema().getName(),
                            booking.getShowtime().getRoom().getName(),
                            booking.getShowtime().getStartTime().toLocalDate().toString(),
                            booking.getShowtime().getStartTime().toLocalTime().toString(),
                            s.getSeat().getSeatLabel()))
                    .build()).collect(java.util.stream.Collectors.toList());

            if (!fnbItemDtos.isEmpty()) {
                ticketDtos.add(com.cinebook.backend.modules.bookings.dto.TicketDto.builder()
                        .seatLabel("Bắp nước")
                        .seatType("FNB")
                        .price(booking.getTotalFnbAmount())
                        .ticketCode(bookingCode + "-FNB")
                        .qrCodeValue(String.format("Mã đơn: %s-FNB\nBắp nước: %s",
                                bookingCode,
                                fnbItemDtos.stream().map(item -> item.getProductName() + " (x" + item.getQuantity() + ")").collect(java.util.stream.Collectors.joining(", "))))
                        .build());
            }

            return (com.cinebook.backend.modules.bookings.dto.MyBookingDto) com.cinebook.backend.modules.bookings.dto.MyBookingDto.builder()
                    .id("BK" + String.format("%03d", booking.getId()))
                    .movieId(booking.getShowtime().getMovie().getMovieId())
                    .movieTitle(booking.getShowtime().getMovie().getTitle())
                    .cinemaName(booking.getShowtime().getRoom().getCinema().getName())
                    .roomName(booking.getShowtime().getRoom().getName())
                    .showDate(booking.getShowtime().getStartTime().toLocalDate().toString())
                    .showTime(booking.getShowtime().getStartTime().toLocalTime().toString())
                    .seatNumber(seatNames)
                    .totalAmount(booking.getTotalAfterTax())
                    .status(booking.getStatus().name().toLowerCase())
                    .checkedIn(booking.getStatus() == BookingStatus.CheckedIn)
                    .fnbItems(fnbItemDtos)
                    .tickets(ticketDtos)
                    .build();
        }).collect(java.util.stream.Collectors.toList());
    }
    public com.cinebook.backend.modules.bookings.dto.MyBookingDto getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        List<BookingSeat> seats = bookingSeatRepository.findByBooking_Id(booking.getId());
        String seatNames = seats.stream()
                .map(s -> s.getSeat().getSeatLabel())
                .collect(java.util.stream.Collectors.joining(", "));

        List<FnBOrderItem> fnbOrderItems = fnbOrderItemRepository.findByBookingId(booking.getId());
        List<FnBItemDto> fnbItemDtos = fnbOrderItems.stream().map(item -> FnBItemDto.builder()
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getUnitPrice() * item.getQuantity())
                .build()).collect(java.util.stream.Collectors.toList());

        String bookingCode = "BK" + String.format("%03d", booking.getId());
        List<com.cinebook.backend.modules.bookings.dto.TicketDto> ticketDtos = seats.stream().map(s -> com.cinebook.backend.modules.bookings.dto.TicketDto.builder()
                .seatLabel(s.getSeat().getSeatLabel())
                .seatType(s.getSeatType().name())
                .price(s.getPriceAtBooking())
                .ticketCode(bookingCode + "-" + s.getSeat().getSeatLabel())
                .qrCodeValue(String.format("Mã vé: %s-%s\nPhim: %s\nRạp: %s\nPhòng: %s\nSuất chiếu: %s %s\nGhế: %s",
                        bookingCode, s.getSeat().getSeatLabel(),
                        booking.getShowtime().getMovie().getTitle(),
                        booking.getShowtime().getRoom().getCinema().getName(),
                        booking.getShowtime().getRoom().getName(),
                        booking.getShowtime().getStartTime().toLocalDate().toString(),
                        booking.getShowtime().getStartTime().toLocalTime().toString(),
                        s.getSeat().getSeatLabel()))
                .build()).collect(java.util.stream.Collectors.toList());

        if (!fnbItemDtos.isEmpty()) {
            ticketDtos.add(com.cinebook.backend.modules.bookings.dto.TicketDto.builder()
                    .seatLabel("Bắp nước")
                    .seatType("FNB")
                    .price(booking.getTotalFnbAmount())
                    .ticketCode(bookingCode + "-FNB")
                    .qrCodeValue(String.format("Mã đơn: %s-FNB\nBắp nước: %s",
                            bookingCode,
                            fnbItemDtos.stream().map(item -> item.getProductName() + " (x" + item.getQuantity() + ")").collect(java.util.stream.Collectors.joining(", "))))
                    .build());
        }

        return com.cinebook.backend.modules.bookings.dto.MyBookingDto.builder()
                .id("BK" + String.format("%03d", booking.getId()))
                .movieId(booking.getShowtime().getMovie().getMovieId())
                .movieTitle(booking.getShowtime().getMovie().getTitle())
                .cinemaName(booking.getShowtime().getRoom().getCinema().getName())
                .roomName(booking.getShowtime().getRoom().getName())
                .showDate(booking.getShowtime().getStartTime().toLocalDate().toString())
                .showTime(booking.getShowtime().getStartTime().toLocalTime().toString())
                .seatNumber(seatNames)
                .totalAmount(booking.getTotalAfterTax())
                .status(booking.getStatus().name().toLowerCase())
                .checkedIn(booking.getStatus() == BookingStatus.CheckedIn)
                .fnbItems(fnbItemDtos)
                .tickets(ticketDtos)
                .build();
    }

    public byte[] exportBookingsToExcel() throws IOException {
        List<Booking> bookings;

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            boolean isScheduleManager = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ScheduleManager"));
            if (isScheduleManager) {
                String email = auth.getName();
                com.cinebook.backend.modules.users.User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                if (user.getCinema() != null) {
                    bookings = bookingRepository.findByShowtimeCinemaCinemaIdOrderByCreatedAtDesc(user.getCinema().getCinemaId());
                } else {
                    bookings = List.of();
                }
            } else {
                bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
            }
        } else {
            bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Báo cáo đặt vé");

            // Define styles
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            CellStyle borderStyle = workbook.createCellStyle();
            borderStyle.setBorderBottom(BorderStyle.THIN);
            borderStyle.setBorderTop(BorderStyle.THIN);
            borderStyle.setBorderLeft(BorderStyle.THIN);
            borderStyle.setBorderRight(BorderStyle.THIN);

            CellStyle amountStyle = workbook.createCellStyle();
            amountStyle.cloneStyleFrom(borderStyle);
            DataFormat format = workbook.createDataFormat();
            amountStyle.setDataFormat(format.getFormat("#,##0\" ₫\""));
            amountStyle.setAlignment(HorizontalAlignment.RIGHT);

            // Header Row
            String[] headers = {
                "STT", "Mã đặt vé", "Ngày đặt", "Tên khách hàng", "Email", "Số điện thoại",
                "Phim", "Rạp", "Phòng chiếu", "Suất chiếu", "Ghế", "Chi tiết bắp nước",
                "Tiền vé", "Tiền bắp nước", "Giảm giá", "Thuế VAT", "Tổng thanh toán", "Trạng thái"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Booking booking : bookings) {
                Row row = sheet.createRow(rowIdx++);

                // Get seats string
                List<BookingSeat> seats = bookingSeatRepository.findByBooking_Id(booking.getId());
                String seatNames = seats.stream()
                        .map(s -> s.getSeat().getSeatLabel())
                        .collect(java.util.stream.Collectors.joining(", "));

                // Get FNB details string
                List<FnBOrderItem> fnbOrderItems = fnbOrderItemRepository.findByBookingId(booking.getId());
                String fnbDetails = fnbOrderItems.stream()
                        .map(item -> item.getProduct().getName() + " (x" + item.getQuantity() + ")")
                        .collect(java.util.stream.Collectors.joining(", "));

                // Get format time
                String showtimeStr = "";
                if (booking.getShowtime() != null) {
                    showtimeStr = booking.getShowtime().getStartTime().toLocalDate().toString() + " " +
                                  booking.getShowtime().getStartTime().toLocalTime().toString();
                }

                // Get formatted date booking
                String createdAtStr = "";
                if (booking.getCreatedAt() != null) {
                    createdAtStr = booking.getCreatedAt().toLocalDate().toString() + " " +
                                   booking.getCreatedAt().toLocalTime().toString();
                }

                // Map status to Vietnamese
                String statusVi = "";
                if (booking.getStatus() != null) {
                    switch (booking.getStatus()) {
                        case Confirmed: statusVi = "Hoàn thành"; break;
                        case Pending: statusVi = "Chờ xử lý"; break;
                        case Cancelled: statusVi = "Đã hủy"; break;
                        case Expired: statusVi = "Hết hạn"; break;
                        case CheckedIn: statusVi = "Đã vào rạp"; break;
                        case Failed: statusVi = "Thất bại"; break;
                        default: statusVi = booking.getStatus().toString();
                    }
                }

                int col = 0;
                // STT
                Cell cellStt = row.createCell(col++);
                cellStt.setCellValue(rowIdx - 1);
                cellStt.setCellStyle(borderStyle);

                // Mã đặt vé
                Cell cellCode = row.createCell(col++);
                cellCode.setCellValue("BK" + String.format("%03d", booking.getId()));
                cellCode.setCellStyle(borderStyle);

                // Ngày đặt
                Cell cellDate = row.createCell(col++);
                cellDate.setCellValue(createdAtStr);
                cellDate.setCellStyle(borderStyle);

                // Tên khách hàng
                Cell cellCust = row.createCell(col++);
                cellCust.setCellValue(booking.getCustomer() != null ? booking.getCustomer().getFullName() : "");
                cellCust.setCellStyle(borderStyle);

                // Email
                Cell cellEmail = row.createCell(col++);
                cellEmail.setCellValue(booking.getCustomer() != null ? booking.getCustomer().getEmail() : "");
                cellEmail.setCellStyle(borderStyle);

                // Số điện thoại
                Cell cellPhone = row.createCell(col++);
                cellPhone.setCellValue(booking.getCustomer() != null ? booking.getCustomer().getPhone() : "");
                cellPhone.setCellStyle(borderStyle);

                // Phim
                Cell cellMovie = row.createCell(col++);
                cellMovie.setCellValue(booking.getShowtime() != null && booking.getShowtime().getMovie() != null ? booking.getShowtime().getMovie().getTitle() : "");
                cellMovie.setCellStyle(borderStyle);

                // Rạp
                Cell cellCinema = row.createCell(col++);
                cellCinema.setCellValue(booking.getShowtime() != null && booking.getShowtime().getRoom() != null && booking.getShowtime().getRoom().getCinema() != null ? booking.getShowtime().getRoom().getCinema().getName() : "");
                cellCinema.setCellStyle(borderStyle);

                // Phòng chiếu
                Cell cellRoom = row.createCell(col++);
                cellRoom.setCellValue(booking.getShowtime() != null && booking.getShowtime().getRoom() != null ? booking.getShowtime().getRoom().getName() : "");
                cellRoom.setCellStyle(borderStyle);

                // Suất chiếu
                Cell cellShow = row.createCell(col++);
                cellShow.setCellValue(showtimeStr);
                cellShow.setCellStyle(borderStyle);

                // Ghế
                Cell cellSeats = row.createCell(col++);
                cellSeats.setCellValue(seatNames);
                cellSeats.setCellStyle(borderStyle);

                // Chi tiết bắp nước
                Cell cellFnbDetail = row.createCell(col++);
                cellFnbDetail.setCellValue(fnbDetails);
                cellFnbDetail.setCellStyle(borderStyle);

                // Tiền vé
                Cell cellTicketAmt = row.createCell(col++);
                cellTicketAmt.setCellValue(booking.getTotalTicketsAmount() != null ? booking.getTotalTicketsAmount() : 0);
                cellTicketAmt.setCellStyle(amountStyle);

                // Tiền bắp nước
                Cell cellFnbAmt = row.createCell(col++);
                cellFnbAmt.setCellValue(booking.getTotalFnbAmount() != null ? booking.getTotalFnbAmount() : 0);
                cellFnbAmt.setCellStyle(amountStyle);

                // Giảm giá
                Cell cellDiscount = row.createCell(col++);
                cellDiscount.setCellValue(booking.getDiscountAmount() != null ? booking.getDiscountAmount() : 0);
                cellDiscount.setCellStyle(amountStyle);

                // Thuế VAT
                Cell cellVat = row.createCell(col++);
                cellVat.setCellValue(booking.getVatAmount() != null ? booking.getVatAmount() : 0);
                cellVat.setCellStyle(amountStyle);

                // Tổng thanh toán
                Cell cellTotal = row.createCell(col++);
                cellTotal.setCellValue(booking.getTotalAfterTax() != null ? booking.getTotalAfterTax() : 0);
                cellTotal.setCellStyle(amountStyle);

                // Trạng thái
                Cell cellStatus = row.createCell(col++);
                cellStatus.setCellValue(statusVi);
                cellStatus.setCellStyle(borderStyle);
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
