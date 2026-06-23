import axiosClient from './axiosClient';

const userApi = {
    getAllUsersAdmin: (params) => {
        return axiosClient.get('/admin/users', { params });
    },
    updateUserStatus: (id, status) => {
        return axiosClient.put(`/admin/users/${id}/status`, null, {
            params: { status }
        });
    }
};

export default userApi;
