import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for Request: Gắn token vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for Response: Chuẩn hóa dữ liệu trả về và xử lý lỗi
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp data của axios
    return response.data;
  },
  (error) => {
    // Nếu lỗi 401 Unauthorized -> Xóa token và có thể redirect về /login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Ném lỗi để component có thể catch được
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
