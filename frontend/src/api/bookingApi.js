import axiosClient from './axiosClient';

const bookingApi = {
    getAllBookingsAdmin: (params) => {
        return axiosClient.get('/bookings/admin', { params });
    },
    
    updateBookingStatusAdmin: (id, status) => {
        return axiosClient.put(`/bookings/admin/${id}/status`, null, {
            params: { status }
        });
    },

    cancelBooking: (id) => {
        return axiosClient.post(`/bookings/${id}/cancel`);
    },

    createBooking: (data) => {
        return axiosClient.post('/bookings', data);
    },
    
    holdSeats: (data) => {
        return axiosClient.post('/bookings/hold-seats', data);
    },

    getMyBookings: () => {
        return axiosClient.get('/bookings/my-bookings');
    },

    getMyTickets: () => {
        return axiosClient.get('/bookings/my-tickets');
    },

    getBookingById: (id) => {
        return axiosClient.get(`/bookings/${id}`);
    }
};

export default bookingApi;
