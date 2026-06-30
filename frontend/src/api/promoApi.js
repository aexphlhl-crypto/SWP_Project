import axiosClient from './axiosClient';

const promoApi = {
    getAllPromos: (params) => {
        return axiosClient.get('/promos', { params });
    },
    
    validatePromo: (params) => {
        return axiosClient.get('/promos/validate', { params });
    },

    createPromo: (data) => {
        return axiosClient.post('/promos', data);
    },

    updatePromo: (id, data) => {
        return axiosClient.put(`/promos/${id}`, data);
    },

    deletePromo: (id) => {
        return axiosClient.delete(`/promos/${id}`);
    }
};

export default promoApi;
