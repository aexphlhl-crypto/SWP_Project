import axiosClient from './axiosClient';

const authApi = {
  login: (data) => {
    return axiosClient.post('/auth/login', data);
  },
  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },
  verifyOtp: (data) => {
    return axiosClient.post('/auth/verify-otp', data);
  },
  resendOtp: (email) => {
    return axiosClient.post(`/auth/resend-otp?email=${encodeURIComponent(email)}`);
  },
  googleLogin: (data) => {
    return axiosClient.post('/auth/google-login', data);
  },
  getCurrentUser: () => {
    return axiosClient.get('/auth/me'); // Optional endpoint if you have it
  },
  updateProfile: (data) => {
    return axiosClient.put('/auth/profile', data);
  },
  forgotPassword: (data) => {
    return axiosClient.post('/auth/forgot-password', data);
  },
  verifyForgotPasswordOtp: (data) => {
    return axiosClient.post('/auth/verify-forgot-password-otp', data);
  },
  resetPassword: (data) => {
    return axiosClient.post('/auth/reset-password', data);
  },
};

export default authApi;
