import axios from 'axios';
import { useStore } from '../store/useStore';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid/expired, log out the user
      useStore.getState().logout();
      window.location.href = '/'; // Force reload to show login screen
    }
    return Promise.reject(error);
  }
);

export default api;
