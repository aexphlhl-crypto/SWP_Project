import axiosClient from './axiosClient';

const fnbApi = {
    getAllProducts: (params) => {
        return axiosClient.get('/fnb/products', { params });
    },
    
    getProductById: (id) => {
        return axiosClient.get(`/fnb/products/${id}`);
    },

    createProduct: (data) => {
        return axiosClient.post('/fnb/products', data);
    },

    updateProduct: (id, data) => {
        return axiosClient.put(`/fnb/products/${id}`, data);
    },

    deleteProduct: (id) => {
        return axiosClient.delete(`/fnb/products/${id}`);
    }
};

export default fnbApi;
