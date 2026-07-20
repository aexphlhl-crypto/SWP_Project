import axiosClient from './axiosClient';

const genreApi = {
    getAll: () => {
        return axiosClient.get('/genres');
    },

    getById: (id) => {
        return axiosClient.get(`/genres/${id}`);
    },

    create: (data) => {
        return axiosClient.post('/genres', data);
    },

    update: (id, data) => {
        return axiosClient.put(`/genres/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`/genres/${id}`);
    }
};

export default genreApi;
