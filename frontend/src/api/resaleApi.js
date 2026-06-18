import axiosClient from './axiosClient';

const resaleApi = {
    getAllListings: (params) => {
        return axiosClient.get('/resale/admin/all', { params });
    },

    getActiveListings: (params) => {
        return axiosClient.get('/resale/active', { params });
    },

    getMyListings: (sellerId, params) => {
        return axiosClient.get('/resale/my-listings', { params: { sellerId, ...params } });
    },

    createListing: (data) => {
        return axiosClient.post('/resale', data);
    },

    updateListing: (id, data) => {
        return axiosClient.put(`/resale/${id}`, data);
    },

    updateStatus: (id, data) => {
        return axiosClient.put(`/resale/${id}/status`, data);
    },

    deleteListing: (id) => {
        return axiosClient.delete(`/resale/${id}`);
    }
};

export default resaleApi;
