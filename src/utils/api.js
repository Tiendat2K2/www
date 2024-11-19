// src/utils/api.js
import axios from 'axios';

// Export the base URL for API usage
export const API_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL, // Use the exported API_URL as the base URL
  headers: {
    'Content-Type': 'application/json', // Default content type
  }
});

// Optional: Add interceptors to handle authorization tokens globally
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`; // Add token to request headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // Return the error if the request fails
  }
);

// Interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to an expired token (401)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried
      try {
        const newToken = await refreshToken(); // Call the refreshToken function
        localStorage.setItem('access_token', newToken); // Update the token in localStorage
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`; // Set the new token in the request header
        return api(originalRequest); // Retry the original request with the new token
      } catch (err) {
        return Promise.reject(err); // Reject if token refresh fails
      }
    }

    return Promise.reject(error); // Reject for other errors
  }
);
// Function to refresh the token
const refreshToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/refresh-token`, {
      // Add necessary information to refresh the token
    });
    const { token } = response.data; // Assuming the API returns a new token
    return token; // Return the new token
  } catch (error) {
    console.error('Unable to refresh token:', error);
    throw error; // Throw error if refresh fails
  }
};

// Export the axios instance for use in other parts of your application
export default api;
