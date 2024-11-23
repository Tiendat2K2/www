// src/utils/axiosInstance.js
import axios from 'axios';
import { refreshToken } from '../server/server';

const axiosInstance = axios.create({
  baseURL: 'https://database-ro16.onrender.com/api', // Thay đổi theo URL API của bạn
});

// Interceptor để kiểm tra token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi 401 (Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu yêu cầu đã thử
      try {
        const newToken = await refreshToken(); // Làm mới token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest); // Gửi lại yêu cầu với token mới
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
