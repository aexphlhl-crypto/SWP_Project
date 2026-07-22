package com.cinebook.backend.modules.dashboard.service;

import com.cinebook.backend.common.enums.UserRole;
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
import org.springframework.data.domain.Sort;
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
    private final com.cinebook.backend.modules.showtimes.repository.ShowtimeRepository showtimeRepository;

    private Long getManagerCinemaId(String username) {
        if (username == null) return null;
        return userRepository.findByEmailAndDeletedAtIsNull(username)
            .filter(u -> u.getRole() == UserRole.ScheduleManager && u.getCinema() != null)
            .map(u -> u.getCinema().getCinemaId())
            .orElse(null);
    }

    private List<Booking> getFilteredBookings(Long cinemaId, List<BookingStatus> validStatuses) {
        List<Booking> bookings = bookingRepository.findByStatusInOrderByCreatedAtDesc(validStatuses);
        if (cinemaId != null) {
            return bookings.stream()
                .filter(b -> b.getShowtime() != null && b.getShowtime().getRoom() != null && b.getShowtime().getRoom().getCinema() != null && b.getShowtime().getRoom().getCinema().getCinemaId().equals(cinemaId))
                .collect(Collectors.toList());
        }
        return bookings;
    }
    
    private List<Booking> getFilteredBookingsInYear(Long cinemaId, List<BookingStatus> validStatuses, LocalDateTime startOfYear, LocalDateTime endOfYear) {
        List<Booking> bookings = bookingRepository.findByStatusInAndCreatedAtBetween(validStatuses, startOfYear, endOfYear);
        if (cinemaId != null) {
            return bookings.stream()
                .filter(b -> b.getShowtime() != null && b.getShowtime().getRoom() != null && b.getShowtime().getRoom().getCinema() != null && b.getShowtime().getRoom().getCinema().getCinemaId().equals(cinemaId))
                .collect(Collectors.toList());
        }
        return bookings;
    }

    public KpiResponse getKpiSummary(String username) {
        Long cinemaId = getManagerCinemaId(username);
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        
        Integer totalRevenue;
        Integer totalTickets;
        Long screenedMovies;
        
        if (cinemaId != null) {
            List<Booking> bookings = bookingRepository.findByShowtimeCinemaCinemaIdOrderByCreatedAtDesc(cinemaId).stream()
                .filter(b -> validStatuses.contains(b.getStatus()))
                .collect(Collectors.toList());
            totalRevenue = bookings.stream().mapToInt(Booking::getTotalAfterTax).sum();
            int total = 0;
            for(Booking b : bookings) {
                total += bookingSeatRepository.countByBooking_Id(b.getId());
            }
            totalTickets = total;
            screenedMovies = bookings.stream().map(b -> b.getShowtime().getMovie().getMovieId()).distinct().count();
        } else {
            totalRevenue = bookingRepository.sumTotalAfterTaxByStatusIn(validStatuses);
            Long totalTicketsLong = bookingSeatRepository.countByBooking_StatusIn(validStatuses);
            totalTickets = totalTicketsLong != null ? totalTicketsLong.intValue() : 0;
            screenedMovies = showtimeRepository.countDistinctMoviesWithShowtimes();
        }
        
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        
        Long newUsers = userRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);

        return KpiResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : 0)
                .totalTickets(totalTickets)
                .newUsers(newUsers)
                .screenedMovies(screenedMovies)
                .build();
    }

    public List<ChartResponse> getRevenueChart(String username) {
        Long cinemaId = getManagerCinemaId(username);
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        int currentYear = LocalDate.now().getYear();
        LocalDateTime startOfYear = LocalDateTime.of(currentYear, 1, 1, 0, 0);
        LocalDateTime endOfYear = LocalDateTime.of(currentYear, 12, 31, 23, 59, 59);

        List<Booking> bookings = getFilteredBookingsInYear(cinemaId, validStatuses, startOfYear, endOfYear);

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

    public byte[] exportRevenueToExcel(String username) throws IOException {
        Long cinemaId = getManagerCinemaId(username);
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        List<Booking> bookings = getFilteredBookings(cinemaId, validStatuses);

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

    public List<MovieRankingResponse> getTopMoviesByRevenue(String username) {
        Long cinemaId = getManagerCinemaId(username);
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        
        if (cinemaId != null) {
            List<Booking> bookings = bookingRepository.findByShowtimeCinemaCinemaIdOrderByCreatedAtDesc(cinemaId).stream()
                .filter(b -> validStatuses.contains(b.getStatus()))
                .collect(Collectors.toList());
            
            Map<Long, BigDecimal> movieRevenue = new HashMap<>();
            Map<Long, String> movieTitle = new HashMap<>();
            
            for (Booking b : bookings) {
                Long movieId = b.getShowtime().getMovie().getMovieId();
                movieTitle.put(movieId, b.getShowtime().getMovie().getTitle());
                movieRevenue.put(movieId, movieRevenue.getOrDefault(movieId, BigDecimal.ZERO).add(new BigDecimal(b.getTotalAfterTax())));
            }
            
            return movieRevenue.entrySet().stream()
                .map(e -> new MovieRankingResponse(e.getKey(), movieTitle.get(e.getKey()), e.getValue()))
                .sorted((a, b) -> b.getMetricValue().compareTo(a.getMetricValue()))
                .limit(5)
                .collect(Collectors.toList());
        }

        Pageable topFive = PageRequest.of(0, 5);
        List<Object[]> results = bookingRepository.findTopMoviesByRevenue(validStatuses, topFive);
        return results.stream().map(row -> new MovieRankingResponse(
                ((Number) row[0]).longValue(),
                (String) row[1],
                new BigDecimal(((Number) row[2]).toString())
        )).collect(Collectors.toList());
    }

    public List<MovieRankingResponse> getTopMoviesByRating(String username) {
        Pageable topFive = PageRequest.of(0, 5);
        List<Object[]> results = reviewRepository.findTopMoviesByRating(ReviewStatus.Active, topFive);
        return results.stream().map(row -> new MovieRankingResponse(
                ((Number) row[0]).longValue(),
                (String) row[1],
                new BigDecimal(((Number) row[2]).toString())
        )).collect(Collectors.toList());
    }

    public List<RecentBookingResponse> getRecentBookings(int limit, String username) {
        Long cinemaId = getManagerCinemaId(username);
        Pageable pageable = PageRequest.of(0, limit);
        org.springframework.data.domain.Page<Booking> page;
        
        if (cinemaId != null) {
            page = bookingRepository.findByShowtimeCinemaCinemaId(cinemaId, pageable);
        } else {
            page = bookingRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        
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

    public List<GenreChartResponse> getGenreChart(String username) {
        Long cinemaId = getManagerCinemaId(username);
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        List<Booking> bookings = getFilteredBookings(cinemaId, validStatuses);

        // Use double to accumulate fractional tickets per genre
        Map<String, Double> genreCounts = new HashMap<>();
        int totalTickets = 0;

        for (Booking b : bookings) {
            if (b.getShowtime() != null && b.getShowtime().getMovie() != null
                    && b.getShowtime().getMovie().getGenres() != null
                    && !b.getShowtime().getMovie().getGenres().isEmpty()) {
                int tickets = bookingSeatRepository.countByBooking_Id(b.getId());
                totalTickets += tickets;
                List<Genre> genres = new ArrayList<>(b.getShowtime().getMovie().getGenres());
                double ticketsPerGenre = (double) tickets / genres.size();
                for (Genre g : genres) {
                    genreCounts.merge(g.getName(), ticketsPerGenre, Double::sum);
                }
            }
        }

        List<String> colors = Arrays.asList("#E50914", "#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#14B8A6");
        List<GenreChartResponse> result = new ArrayList<>();
        int colorIdx = 0;

        for (Map.Entry<String, Double> entry : genreCounts.entrySet()) {
            int percentage = totalTickets > 0
                    ? (int) Math.round(entry.getValue() * 100.0 / totalTickets)
                    : 0;
            result.add(new GenreChartResponse(entry.getKey(), percentage, colors.get(colorIdx % colors.size())));
            colorIdx++;
        }

        result.sort((a, b) -> Integer.compare(b.getValue(), a.getValue()));
        return result.stream().limit(7).collect(Collectors.toList());
    }

    public List<CinemaChartResponse> getCinemaChart(String username) {
        Long cinemaId = getManagerCinemaId(username);
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        List<Booking> bookings = getFilteredBookings(cinemaId, validStatuses);

        Map<String, int[]> cinemaStats = new HashMap<>(); // [tickets, revenue]

        for (Booking b : bookings) {
            if (b.getShowtime() != null && b.getShowtime().getRoom() != null && b.getShowtime().getRoom().getCinema() != null) {
                String cinemaName = b.getShowtime().getRoom().getCinema().getName();
                int tickets = bookingSeatRepository.countByBooking_Id(b.getId());
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

    public List<WeekdayChartResponse> getWeekdayChart(String username) {
        Long cinemaId = getManagerCinemaId(username);
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.Confirmed, BookingStatus.CheckedIn);
        int currentYear = LocalDate.now().getYear();
        LocalDateTime startOfYear = LocalDateTime.of(currentYear, 1, 1, 0, 0);
        LocalDateTime endOfYear = LocalDateTime.of(currentYear, 12, 31, 23, 59, 59);

        List<Booking> bookings = getFilteredBookingsInYear(cinemaId, validStatuses, startOfYear, endOfYear);

        Map<java.time.DayOfWeek, List<Integer>> dailyTickets = new EnumMap<>(java.time.DayOfWeek.class);
        for (java.time.DayOfWeek day : java.time.DayOfWeek.values()) {
            dailyTickets.put(day, new ArrayList<>());
        }

        Map<LocalDate, Integer> dateTickets = new HashMap<>();
        for (Booking b : bookings) {
            if (b.getCreatedAt() != null) {
                LocalDate d = b.getCreatedAt().toLocalDate();
                int tickets = bookingSeatRepository.countByBooking_Id(b.getId());
                dateTickets.put(d, dateTickets.getOrDefault(d, 0) + tickets);
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
