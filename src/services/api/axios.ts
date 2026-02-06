
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Utiliser l'URL du backend depuis les variables d'environnement
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Timeout de 15 secondes
});

// Request Interceptor: Inject Bearer Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('toona_admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log seulement en développement
    if (import.meta.env.DEV) {
      console.log(`Sending Request: ${config.method?.toUpperCase()} ${config.url}`);
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
        localStorage.removeItem('toona_admin_user');
        window.location.href = '#/login';
      }
      
      // Log seulement en développement
      if (import.meta.env.DEV) {
        console.error(`Response Error: ${status} - ${error.response.config.url}`);
      }
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      // Timeout - ne pas afficher d'erreur globale
      if (import.meta.env.DEV) {
        console.error('Request timeout:', error.config?.url);
      }
    } else {
      // Network error ou serveur inaccessible - ne pas afficher d'erreur globale
      if (import.meta.env.DEV) {
        console.error('Network Error:', error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
