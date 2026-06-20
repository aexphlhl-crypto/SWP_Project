import axiosClient from './axiosClient';

const showtimeApi = {
    getAllShowtimes: (params) => {
        return axiosClient.get('/showtimes', { params });
    },
    
    getShowtimeById: (id) => {
        return axiosClient.get(`/showtimes/${id}`);
    },

    getSeats: (id) => {
        return axiosClient.get(`/showtimes/${id}/seats?t=${new Date().getTime()}`);
    },

    createShowtime: (data) => {
        return axiosClient.post('/showtimes', data);
    },

    holdSeat: (showtimeId, seatId) => {
        return axiosClient.post(`/showtimes/${showtimeId}/seats/${seatId}/hold`);
    },

    releaseSeat: (showtimeId, seatId) => {
        return axiosClient.delete(`/showtimes/${showtimeId}/seats/${seatId}/hold`);
    },

    releaseAllHolds: (showtimeId) => {
        return axiosClient.delete(`/showtimes/${showtimeId}/seats/hold/all`);
    },

    updateShowtime: (id, data) => {
        return axiosClient.put(`/showtimes/${id}`, data);
    },

    deleteShowtime: (id) => {
        return axiosClient.delete(`/showtimes/${id}`);
    }
};

export default showtimeApi;
