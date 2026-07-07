import axiosClient from './axiosClient';

const dashboardApi = {
    getKpiSummary: () => {
        return axiosClient.get('/dashboard/kpi');
    },
    
    getRevenueChart: () => {
        return axiosClient.get('/dashboard/chart/revenue');
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

    exportExcel: () => {
        return axiosClient.get('/dashboard/export/excel', { responseType: 'blob' });
    },

    getRecentBookings: (limit = 10) => {
        return axiosClient.get(`/dashboard/recent-bookings?limit=${limit}`);
    },

    getGenreChart: () => {
        return axiosClient.get('/dashboard/chart/genre');
    },

    getCinemaChart: () => {
        return axiosClient.get('/dashboard/chart/cinema');
    },

    getWeekdayChart: () => {
        return axiosClient.get('/dashboard/chart/weekday');
    }
};

export default dashboardApi;
