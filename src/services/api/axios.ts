
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Bearer Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('toona_admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;
      
      // 401/403: Auto-logout and redirect
      if (status === 401 || status === 403 || status === 405) {
        localStorage.removeItem('toona_admin_token');
        window.location.href = '#/login';
      }
      
      // Global Notification for other errors (handled via context usually, but here we can emit event)
      const message = (error.response.data as any)?.message || 'An unexpected error occurred';
      window.dispatchEvent(new CustomEvent('app-error', { detail: { message, status } }));
    } else {
      window.dispatchEvent(new CustomEvent('app-error', { detail: { message: 'Network Error' } }));
    }
    
    return Promise.reject(error);
  }
);

export default api;
