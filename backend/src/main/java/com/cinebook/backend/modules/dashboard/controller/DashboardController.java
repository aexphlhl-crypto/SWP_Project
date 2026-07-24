package com.cinebook.backend.modules.dashboard.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.dashboard.dto.ChartResponse;
import com.cinebook.backend.modules.dashboard.dto.KpiResponse;
import com.cinebook.backend.modules.dashboard.dto.MovieRankingResponse;
import com.cinebook.backend.modules.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinebook.backend.modules.dashboard.dto.GenreChartResponse;
import com.cinebook.backend.modules.dashboard.dto.CinemaChartResponse;
import com.cinebook.backend.modules.dashboard.dto.WeekdayChartResponse;
import com.cinebook.backend.modules.dashboard.dto.RecentBookingResponse;
import org.springframework.web.bind.annotation.RequestParam;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/kpi")
    public ApiResponse<KpiResponse> getKpiSummary(
            @RequestParam(required = false) Integer year,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(dashboardService.getKpiSummary(userDetails.getUsername(), year));
    }

    @GetMapping("/chart/revenue")
    public ApiResponse<List<ChartResponse>> getRevenueChart(
            @RequestParam(required = false) Integer year,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(dashboardService.getRevenueChart(userDetails.getUsername(), year));
    }

    @GetMapping("/export/excel")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ResponseEntity<byte[]> exportRevenueToExcel(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate,
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) Long movieId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            byte[] excelContent = dashboardService.exportRevenueToExcel(userDetails.getUsername(), startDate, endDate, cinemaId, movieId);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"revenue_report.xlsx\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelContent);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/movies/top-revenue")
    public ApiResponse<List<MovieRankingResponse>> getTopMoviesByRevenue(@AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(dashboardService.getTopMoviesByRevenue(userDetails.getUsername()));
    }

    @GetMapping("/movies/top-rating")
    public ApiResponse<List<MovieRankingResponse>> getTopMoviesByRating(@AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(dashboardService.getTopMoviesByRating(userDetails.getUsername()));
    }

    @GetMapping("/recent-bookings")
    public ApiResponse<List<RecentBookingResponse>> getRecentBookings(@RequestParam(defaultValue = "10") int limit, @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(dashboardService.getRecentBookings(limit, userDetails.getUsername()));
    }

    @GetMapping("/chart/genre")
    public ApiResponse<List<GenreChartResponse>> getGenreChart(
            @RequestParam(required = false) Integer year,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(dashboardService.getGenreChart(userDetails.getUsername(), year));
    }

    @GetMapping("/chart/cinema")
    public ApiResponse<List<CinemaChartResponse>> getCinemaChart(
            @RequestParam(required = false) Integer year,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(dashboardService.getCinemaChart(userDetails.getUsername(), year));
    }

    @GetMapping("/chart/monthly-tickets")
    public ApiResponse<List<ChartResponse>> getMonthlyTicketsChart(
            @RequestParam(required = false) Integer year,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(dashboardService.getMonthlyTicketsChart(userDetails.getUsername(), year));
    }

    @GetMapping("/chart/weekday")
    public ApiResponse<List<WeekdayChartResponse>> getWeekdayChart(
            @RequestParam(required = false) Integer weekOffset,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(dashboardService.getWeekdayChart(userDetails.getUsername(), weekOffset));
    }
}
