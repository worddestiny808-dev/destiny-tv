import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

const token = localStorage.getItem('destiny_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('destiny_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
