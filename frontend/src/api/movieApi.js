import axiosClient from './axiosClient';

const movieApi = {
  getMovies: (params) => {
    return axiosClient.get('/movies', { params });
  },
  getMovieById: (id) => {
    return axiosClient.get(`/movies/${id}`);
  },
  createMovie: (data) => {
    return axiosClient.post('/movies', data);
  },
  updateMovie: (id, data) => {
    return axiosClient.put(`/movies/${id}`, data);
  },
  deleteMovie: (id) => {
    return axiosClient.delete(`/movies/${id}`);
  }
};

export default movieApi;
