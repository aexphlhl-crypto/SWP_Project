import axiosClient from './axiosClient';

const adminUserApi = {
    getAllUsers(params) {
        return axiosClient.get('/admin/users', { params });
    },
    updateUserStatus(id, status) {
        return axiosClient.put(`/admin/users/${id}/status`, null, { params: { status } });
    },
    lockUser(id, days) {
        return axiosClient.put(`/admin/users/${id}/lock`, null, { params: { days } });
    },
    unlockUser(id) {
        return axiosClient.put(`/admin/users/${id}/unlock`);
    },
    createManager(data) {
        return axiosClient.post('/admin/users/managers', data);
    },
    deleteManager(id) {
        return axiosClient.delete(`/admin/users/managers/${id}`);
    }
};

export default adminUserApi;
