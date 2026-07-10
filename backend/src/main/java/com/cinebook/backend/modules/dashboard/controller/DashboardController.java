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

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/kpi")
    public ApiResponse<KpiResponse> getKpiSummary() {
        return ApiResponse.ok(dashboardService.getKpiSummary());
    }

    @GetMapping("/chart/revenue")
    public ApiResponse<List<ChartResponse>> getRevenueChart() {
        return ApiResponse.ok(dashboardService.getRevenueChart());
    }

    @GetMapping("/export/excel")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ResponseEntity<byte[]> exportRevenueToExcel() {
        try {
            byte[] excelContent = dashboardService.exportRevenueToExcel();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"revenue_report.xlsx\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelContent);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/movies/top-revenue")
    public ApiResponse<List<MovieRankingResponse>> getTopMoviesByRevenue() {
        return ApiResponse.ok(dashboardService.getTopMoviesByRevenue());
    }

    @GetMapping("/movies/top-rating")
    public ApiResponse<List<MovieRankingResponse>> getTopMoviesByRating() {
        return ApiResponse.ok(dashboardService.getTopMoviesByRating());
    }

    @GetMapping("/recent-bookings")
    public ApiResponse<List<RecentBookingResponse>> getRecentBookings(@RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.ok(dashboardService.getRecentBookings(limit));
    }

    @GetMapping("/chart/genre")
    public ApiResponse<List<GenreChartResponse>> getGenreChart() {
        return ApiResponse.ok(dashboardService.getGenreChart());
    }

    @GetMapping("/chart/cinema")
    public ApiResponse<List<CinemaChartResponse>> getCinemaChart() {
        return ApiResponse.ok(dashboardService.getCinemaChart());
    }

    @GetMapping("/chart/weekday")
    public ApiResponse<List<WeekdayChartResponse>> getWeekdayChart() {
        return ApiResponse.ok(dashboardService.getWeekdayChart());
    }
}
