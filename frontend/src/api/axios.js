import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(
  function (config) {
    const savedUser = localStorage.getItem('visitor-pass-auth');

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);

      if (parsedUser && parsedUser.token) {
        config.headers.Authorization = 'Bearer ' + parsedUser.token;
      }
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default api;