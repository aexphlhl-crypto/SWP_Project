import axiosClient from './axiosClient';

const actorApi = {
    getAll: (search) => {
        const params = search ? { search } : {};
        return axiosClient.get('/actors', { params });
    },

    getById: (id) => {
        return axiosClient.get(`/actors/${id}`);
    },

    create: (data) => {
        return axiosClient.post('/actors', data);
    },

    update: (id, data) => {
        return axiosClient.put(`/actors/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`/actors/${id}`);
    }
};

export default actorApi;
