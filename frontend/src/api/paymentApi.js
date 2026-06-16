import axiosClient from './axiosClient';

const paymentApi = {
    /**
     * Tạo URL thanh toán VNPay cho bookingId
     * @param {number} bookingId
     * @returns {Promise<{success: boolean, data: string}>}  data = payment URL
     */
    createVNPayUrl: (bookingId) => {
        return axiosClient.post('/payments/create-url', null, {
            params: { bookingId }
        });
    }
};

export default paymentApi;
