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
import com.cinebook.backend.modules.notifications.service.NotificationService;
import com.cinebook.backend.modules.bookings.entity.FnBOrderItem;
import com.cinebook.backend.modules.bookings.repository.FnBOrderItemRepository;
import com.cinebook.backend.modules.fnb.entity.FnBProduct;
import com.cinebook.backend.modules.fnb.repository.FnBProductRepository;
import com.cinebook.backend.modules.bookings.dto.FnBItemRequest;
import com.cinebook.backend.modules.bookings.dto.FnBItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final SystemConfigService systemConfigService;
    private final NotificationService notificationService;
    private final FnBOrderItemRepository fnbOrderItemRepository;
    private final FnBProductRepository fnbProductRepository;

    @Transactional
    public Booking createBooking(Long customerId, Long showtimeId, List<Long> seatIds, List<FnBItemRequest> fnbItems) {
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
            
            BigDecimal multiplier = BigDecimal.ONE;
            if (seat.getSeatType() == SeatType.VIP) {
                multiplier = vipMultiplier;
            } else if (seat.getSeatType() == SeatType.Couple) {
                multiplier = coupleMultiplier;
            }
            
            int basePrice = systemConfigService.getBasePrice().intValue();
            
            BigDecimal roomMultiplier = BigDecimal.ONE;
            if ("3D".equalsIgnoreCase(room.getRoomType())) {
                roomMultiplier = systemConfigService.getRoom3DMultiplier();
            } else if ("IMAX".equalsIgnoreCase(room.getRoomType())) {
                roomMultiplier = systemConfigService.getRoomIMAXMultiplier();
            }
            
            int seatPrice = BigDecimal.valueOf(basePrice)
                .multiply(roomMultiplier)
                .multiply(multiplier)
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

        // Trigger notification
        String notificationTitle = "Đặt vé thành công";
        String notificationMessage = String.format("Vé xem phim %s của bạn đã được đặt. Vui lòng thanh toán trong vòng %d phút.",
                showtime.getMovie().getTitle(), holdMinutes);
        notificationService.createNotification(customer.getUserId(), notificationTitle, notificationMessage);

        return savedBooking;
    }

    public org.springframework.data.domain.Page<com.cinebook.backend.modules.bookings.dto.BookingAdminDto> getAllBookingsAdmin(org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<Booking> bookings = bookingRepository.findAll(pageable);
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
                    .qrCodeValue(bookingCode + "-" + s.getSeat().getSeatLabel())
                    .build()).collect(java.util.stream.Collectors.toList());

            if (!fnbItemDtos.isEmpty()) {
                ticketDtos.add(com.cinebook.backend.modules.bookings.dto.TicketDto.builder()
                        .seatLabel("Bắp nước")
                        .seatType("FNB")
                        .price(booking.getTotalFnbAmount())
                        .ticketCode(bookingCode + "-FNB")
                        .qrCodeValue(bookingCode + "-FNB")
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
                .qrCodeValue(bookingCode + "-" + s.getSeat().getSeatLabel())
                .build()).collect(java.util.stream.Collectors.toList());

        if (!fnbItemDtos.isEmpty()) {
            ticketDtos.add(com.cinebook.backend.modules.bookings.dto.TicketDto.builder()
                    .seatLabel("Bắp nước")
                    .seatType("FNB")
                    .price(booking.getTotalFnbAmount())
                    .ticketCode(bookingCode + "-FNB")
                    .qrCodeValue(bookingCode + "-FNB")
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
}
