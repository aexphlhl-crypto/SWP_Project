import axiosClient from './axiosClient';

const reviewApi = {
    getMovieReviews(movieId) {
        return axiosClient.get(`/reviews/movie/${movieId}`);
    },
    createReview(data) {
        return axiosClient.post('/reviews', data);
    },
    getReviewByBookingId(bookingId) {
        return axiosClient.get(`/reviews/booking/${bookingId}`);
    },
    getAllReviewsAdmin(params) {
        return axiosClient.get('/reviews/admin', { params });
    },
    updateReviewStatus(id, status) {
        // use PUT /api/reviews/admin/{id}/status?status={status}
        return axiosClient.put(`/reviews/admin/${id}/status`, null, { params: { status } });
    }
};

export default reviewApi;
