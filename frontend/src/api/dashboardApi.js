import axiosClient from './axiosClient';

const dashboardApi = {
    getKpiSummary: (year) => {
        return axiosClient.get(`/dashboard/kpi${year ? '?year=' + year : ''}`);
    },
    
    getRevenueChart: (year) => {
        return axiosClient.get(`/dashboard/chart/revenue${year ? '?year=' + year : ''}`);
    },

    getTopMoviesByRevenue: () => {
        return axiosClient.get('/dashboard/movies/top-revenue');
    },

    getTopMoviesByRating: () => {
        return axiosClient.get('/dashboard/movies/top-rating');
    },

    exportExcelUrl: () => {
        // Return URL for window.open to trigger download
        return `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/dashboard/export/excel`;
    },

    exportExcel: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.cinemaId) queryParams.append('cinemaId', params.cinemaId);
        if (params.movieId) queryParams.append('movieId', params.movieId);
        const queryStr = queryParams.toString();
        return axiosClient.get(`/dashboard/export/excel${queryStr ? '?' + queryStr : ''}`, { responseType: 'blob' });
    },

    getRecentBookings: (limit = 10) => {
        return axiosClient.get(`/dashboard/recent-bookings?limit=${limit}`);
    },

    getGenreChart: (year) => {
        return axiosClient.get(`/dashboard/chart/genre${year ? '?year=' + year : ''}`);
    },

    getCinemaChart: (year) => {
        return axiosClient.get(`/dashboard/chart/cinema${year ? '?year=' + year : ''}`);
    },

    getMonthlyTicketsChart: (year) => {
        return axiosClient.get(`/dashboard/chart/monthly-tickets${year ? '?year=' + year : ''}`);
    },

    getWeekdayChart: (weekOffset) => {
        return axiosClient.get(`/dashboard/chart/weekday${weekOffset !== undefined && weekOffset !== null ? '?weekOffset=' + weekOffset : ''}`);
    }
};

export default dashboardApi;
