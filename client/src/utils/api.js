import axios from 'axios';
import { useStore } from '../store/useStore';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[API] Sending request with token:', token.substring(0, 20) + '...');
  } else {
    console.warn('[API] No token available for request');
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('[API] 401 Unauthorized - Token may be invalid');
      const currentPath = window.location.pathname;
      // Prevent infinite redirect loops
      if (currentPath !== '/') {
        // Token is invalid/expired, log out the user
        useStore.getState().logout();
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
