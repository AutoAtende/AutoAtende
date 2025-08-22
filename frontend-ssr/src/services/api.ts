import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend.autoatende.com';

// Main authenticated API instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Public API instance (no auth required)
export const openApi = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('companyId');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
