import axiosClient from './axiosClient';

const newsApi = {
    getAllArticles: (params) => {
        return axiosClient.get('/news', { params });
    },
    
    getArticleById: (id) => {
        return axiosClient.get(`/news/${id}`);
    },

    createArticle: (data, createdBy) => {
        return axiosClient.post('/news', data, {
            params: createdBy ? { createdBy } : {}
        });
    },

    updateArticle: (id, data) => {
        return axiosClient.put(`/news/${id}`, data);
    },

    deleteArticle: (id) => {
        return axiosClient.delete(`/news/${id}`);
    }
};

export default newsApi;
