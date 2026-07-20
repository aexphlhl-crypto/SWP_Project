import axiosClient from './axiosClient';

const cinemaApi = {
  getCinemas: (params) => {
    return axiosClient.get('/cinemas', { params });
  },
  getCinemaById: (id) => {
    return axiosClient.get(`/cinemas/${id}`);
  },
  createCinema: (data) => {
    return axiosClient.post('/cinemas', data);
  },
  updateCinema: (id, data) => {
    return axiosClient.put(`/cinemas/${id}`, data);
  },
  deleteCinema: (id) => {
    return axiosClient.delete(`/cinemas/${id}`);
  }
};

export default cinemaApi;
