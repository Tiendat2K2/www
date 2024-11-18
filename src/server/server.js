// src/api/auth.js
import { message } from 'antd'; 
import { jwtDecode } from 'jwt-decode'; 
import api from '../utils/api'; 
import { API_URL } from '../utils/api'; 

export const login = async (username, password, setLoading, navigate) => {
  setLoading(true);

  try {
    const response = await api.post(`${API_URL}/auth/login`, {
      Username: username,
      Password: password,
    });

    const { status, message: serverMessage, access_token, refresh_token, isAdmin } = response.data;

    if (status === 1) {
      message.success(serverMessage);
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('isAdmin', isAdmin);

      const decodedToken = jwtDecode(access_token);
      const UserID = decodedToken.id;

      const userResponse = await api.get(`${API_URL}/auth/getUserById?UserID=${UserID}`, {
        headers: { 'Authorization': `Bearer ${access_token}` },
      });

      if (userResponse.data.status === 1) {
        console.log('User data fetched:', userResponse.data.data);
      } else {
        console.error('Failed to fetch user data');
      }

      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/teacher');
      }
    } else {
      message.error('Đăng nhập thất bại!');
    }
  } catch (error) {
    message.error(error.response?.data?.message || 'Có lỗi xảy ra trong quá trình đăng nhập.');
  } finally {
    setLoading(false);
  }
};

// API call to refresh token
export const refreshToken = async (refreshToken) => {
  try {
    const response = await api.post(
      '/auth/refresh-token',
      { refresh_token: refreshToken },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Example of using refreshToken in a component or service
export const fetchDataWithRefresh = async (url) => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      const newTokenData = await refreshToken(localStorage.getItem('refresh_token'));
      localStorage.setItem('access_token', newTokenData.access_token); // Update access token
      return fetchDataWithRefresh(url); // Retry the original request
    }
    throw error; // Rethrow if not a 401 error
  }
};