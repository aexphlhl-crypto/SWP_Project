package com.cinebook.backend.modules.dashboard.service;

import com.cinebook.backend.modules.bookings.entity.Booking;
import com.cinebook.backend.modules.bookings.entity.BookingStatus;
import com.cinebook.backend.modules.bookings.repository.BookingRepository;
import com.cinebook.backend.modules.dashboard.dto.ChartResponse;
import com.cinebook.backend.modules.dashboard.dto.KpiResponse;
import com.cinebook.backend.modules.reviews.repository.ReviewRepository;
import com.cinebook.backend.modules.reviews.entity.ReviewStatus;
import com.cinebook.backend.modules.dashboard.dto.MovieRankingResponse;
import com.cinebook.backend.modules.dashboard.dto.RecentBookingResponse;
import com.cinebook.backend.modules.dashboard.dto.GenreChartResponse;
import com.cinebook.backend.modules.dashboard.dto.CinemaChartResponse;
import com.cinebook.backend.modules.dashboard.dto.WeekdayChartResponse;
import com.cinebook.backend.modules.bookings.entity.BookingSeat;
import com.cinebook.backend.modules.movies.entity.Genre;
import com.cinebook.backend.modules.users.UserRepository;
import com.cinebook.backend.modules.bookings.repository.BookingSeatRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public KpiResponse getKpiSummary() {
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        Integer totalRevenue = bookingRepository.sumTotalAfterTaxByStatusIn(validStatuses);
        Integer totalTickets = bookingRepository.sumTotalTicketsAmountByStatusIn(validStatuses);
        
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        
        Long newUsers = userRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);

        return KpiResponse.builder()
                .totalRevenue(totalRevenue)
                .totalTickets(totalTickets)
                .newUsers(newUsers)
                .build();
    }

    public List<ChartResponse> getRevenueChart() {
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        int currentYear = LocalDate.now().getYear();
        LocalDateTime startOfYear = LocalDateTime.of(currentYear, 1, 1, 0, 0);
        LocalDateTime endOfYear = LocalDateTime.of(currentYear, 12, 31, 23, 59, 59);

        List<Booking> bookings = bookingRepository.findByStatusInAndCreatedAtBetween(validStatuses, startOfYear, endOfYear);

        Map<String, Integer> revenueByMonth = new HashMap<>();
        for (int i = 1; i <= 12; i++) {
            revenueByMonth.put("Month " + i, 0);
        }

        for (Booking booking : bookings) {
            String monthLabel = "Month " + booking.getCreatedAt().getMonthValue();
            revenueByMonth.put(monthLabel, revenueByMonth.get(monthLabel) + booking.getTotalAfterTax());
        }

        List<ChartResponse> result = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            String label = "Month " + i;
            result.add(new ChartResponse(label, revenueByMonth.get(label)));
        }

        return result;
    }

    public byte[] exportRevenueToExcel() throws IOException {
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        List<Booking> bookings = bookingRepository.findByStatusInOrderByCreatedAtDesc(validStatuses);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Revenue Report");

            // Header Row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Booking ID");
            headerRow.createCell(1).setCellValue("Showtime ID");
            headerRow.createCell(2).setCellValue("Total After Tax");
            headerRow.createCell(3).setCellValue("Created At");

            int rowIdx = 1;
            for (Booking booking : bookings) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(booking.getId() != null ? booking.getId().toString() : "");
                row.createCell(1).setCellValue(booking.getShowtime() != null && booking.getShowtime().getShowtimeId() != null ? booking.getShowtime().getShowtimeId().toString() : "");
                row.createCell(2).setCellValue(booking.getTotalAfterTax() != null ? booking.getTotalAfterTax() : 0);
                row.createCell(3).setCellValue(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : "");
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public List<MovieRankingResponse> getTopMoviesByRevenue() {
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        Pageable topFive = PageRequest.of(0, 5);
        List<Object[]> results = bookingRepository.findTopMoviesByRevenue(validStatuses, topFive);
        return results.stream().map(row -> new MovieRankingResponse(
                ((Number) row[0]).longValue(),
                (String) row[1],
                new BigDecimal(((Number) row[2]).toString())
        )).collect(Collectors.toList());
    }

    public List<MovieRankingResponse> getTopMoviesByRating() {
        Pageable topFive = PageRequest.of(0, 5);
        List<Object[]> results = reviewRepository.findTopMoviesByRating(ReviewStatus.Active, topFive);
        return results.stream().map(row -> new MovieRankingResponse(
                ((Number) row[0]).longValue(),
                (String) row[1],
                new BigDecimal(((Number) row[2]).toString())
        )).collect(Collectors.toList());
    }

    public List<RecentBookingResponse> getRecentBookings(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        org.springframework.data.domain.Page<Booking> page = bookingRepository.findAllByOrderByCreatedAtDesc(pageable);
        return page.getContent().stream().map(b -> {
            List<BookingSeat> bookingSeats = bookingSeatRepository.findByBooking_Id(b.getId());
            String seats = "";
            if (bookingSeats != null && !bookingSeats.isEmpty()) {
                seats = bookingSeats.stream()
                        .map(s -> s.getSeat().getSeatLabel())
                        .collect(Collectors.joining(", "));
            }
            String customerName = b.getCustomer() != null ? b.getCustomer().getFullName() : "Khách vãng lai";
            String movieName = (b.getShowtime() != null && b.getShowtime().getMovie() != null) ? b.getShowtime().getMovie().getTitle() : "";
            
            return RecentBookingResponse.builder()
                    .id("BK" + b.getId())
                    .movie(movieName)
                    .customer(customerName)
                    .seats(seats)
                    .amount(b.getTotalAfterTax() != null ? b.getTotalAfterTax() + "₫" : "0₫")
                    .status(b.getStatus() != null ? b.getStatus().name() : "Pending")
                    .build();
        }).collect(Collectors.toList());
    }

    public List<GenreChartResponse> getGenreChart() {
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        List<Booking> bookings = bookingRepository.findByStatusInOrderByCreatedAtDesc(validStatuses);

        Map<String, Integer> genreCounts = new HashMap<>();
        int totalTickets = 0;

        for (Booking b : bookings) {
            if (b.getShowtime() != null && b.getShowtime().getMovie() != null && b.getShowtime().getMovie().getGenres() != null) {
                int tickets = b.getTotalTicketsAmount() != null ? b.getTotalTicketsAmount() : 0;
                totalTickets += tickets;
                for (Genre g : b.getShowtime().getMovie().getGenres()) {
                    genreCounts.put(g.getName(), genreCounts.getOrDefault(g.getName(), 0) + tickets);
                }
            }
        }

        List<String> colors = Arrays.asList("#E50914", "#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#14B8A6");
        List<GenreChartResponse> result = new ArrayList<>();
        int colorIdx = 0;

        for (Map.Entry<String, Integer> entry : genreCounts.entrySet()) {
            int percentage = totalTickets > 0 ? (int) Math.round((double) entry.getValue() * 100 / totalTickets) : 0;
            result.add(new GenreChartResponse(entry.getKey(), percentage, colors.get(colorIdx % colors.size())));
            colorIdx++;
        }

        result.sort((a, b) -> Integer.compare(b.getValue(), a.getValue()));
        return result.stream().limit(5).collect(Collectors.toList());
    }

    public List<CinemaChartResponse> getCinemaChart() {
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        List<Booking> bookings = bookingRepository.findByStatusInOrderByCreatedAtDesc(validStatuses);

        Map<String, int[]> cinemaStats = new HashMap<>(); // [tickets, revenue]

        for (Booking b : bookings) {
            if (b.getShowtime() != null && b.getShowtime().getRoom() != null && b.getShowtime().getRoom().getCinema() != null) {
                String cinemaName = b.getShowtime().getRoom().getCinema().getName();
                int tickets = b.getTotalTicketsAmount() != null ? b.getTotalTicketsAmount() : 0;
                int revenue = b.getTotalAfterTax() != null ? b.getTotalAfterTax() : 0;

                cinemaStats.putIfAbsent(cinemaName, new int[]{0, 0});
                cinemaStats.get(cinemaName)[0] += tickets;
                cinemaStats.get(cinemaName)[1] += revenue;
            }
        }

        List<CinemaChartResponse> result = new ArrayList<>();
        for (Map.Entry<String, int[]> entry : cinemaStats.entrySet()) {
            result.add(new CinemaChartResponse(entry.getKey(), entry.getValue()[0], new BigDecimal(entry.getValue()[1] / 1000000.0)));
        }

        result.sort((a, b) -> Integer.compare(b.getTickets(), a.getTickets()));
        return result;
    }

    public List<WeekdayChartResponse> getWeekdayChart() {
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        int currentYear = LocalDate.now().getYear();
        LocalDateTime startOfYear = LocalDateTime.of(currentYear, 1, 1, 0, 0);
        LocalDateTime endOfYear = LocalDateTime.of(currentYear, 12, 31, 23, 59, 59);

        List<Booking> bookings = bookingRepository.findByStatusInAndCreatedAtBetween(validStatuses, startOfYear, endOfYear);

        Map<java.time.DayOfWeek, List<Integer>> dailyTickets = new EnumMap<>(java.time.DayOfWeek.class);
        for (java.time.DayOfWeek day : java.time.DayOfWeek.values()) {
            dailyTickets.put(day, new ArrayList<>());
        }

        // Group by LocalDate to find total tickets per specific date, then average by day of week
        Map<LocalDate, Integer> dateTickets = new HashMap<>();
        for (Booking b : bookings) {
            if (b.getCreatedAt() != null) {
                LocalDate d = b.getCreatedAt().toLocalDate();
                dateTickets.put(d, dateTickets.getOrDefault(d, 0) + (b.getTotalTicketsAmount() != null ? b.getTotalTicketsAmount() : 0));
            }
        }

        for (Map.Entry<LocalDate, Integer> entry : dateTickets.entrySet()) {
            dailyTickets.get(entry.getKey().getDayOfWeek()).add(entry.getValue());
        }

        String[] viDays = {"", "T2", "T3", "T4", "T5", "T6", "T7", "CN"};
        List<WeekdayChartResponse> result = new ArrayList<>();

        for (int i = 1; i <= 7; i++) {
            java.time.DayOfWeek day = java.time.DayOfWeek.of(i);
            List<Integer> list = dailyTickets.get(day);
            int avg = 0;
            if (!list.isEmpty()) {
                int sum = 0;
                for (int v : list) sum += v;
                avg = sum / list.size();
            }
            result.add(new WeekdayChartResponse(viDays[i], avg));
        }

        return result;
    }
}
