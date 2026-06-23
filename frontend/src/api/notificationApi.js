import axiosClient from './axiosClient';

const notificationApi = {
    getNotifications(userId) {
        return axiosClient.get('/notifications', { params: { userId } });
    },
    markAsRead(id) {
        return axiosClient.put(`/notifications/${id}/read`);
    },
    markAllAsRead(userId) {
        return axiosClient.put('/notifications/read-all', null, { params: { userId } });
    }
};

export default notificationApi;
