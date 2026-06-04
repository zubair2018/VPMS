import axios from 'axios';

// Create one axios instance for all API requests
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add token automatically before every request
api.interceptors.request.use(
  function (config) {
    // Read saved login data from localStorage
    const savedAuth = localStorage.getItem('vpms_auth');

    if (savedAuth) {
      const parsedAuth = JSON.parse(savedAuth);

      // If token exists, add it to request header
      if (parsedAuth && parsedAuth.token) {
        config.headers.Authorization = 'Bearer ' + parsedAuth.token;
      }
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default api;