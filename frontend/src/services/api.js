// src/services/api.js
import axios from 'axios';

// Base API URL
const API_BASE = "https://heavenlynatureschools-qpvf.onrender.com/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== Request Interceptor =====
api.interceptors.request.use(
  config => {
    // Add Authorization header if token exists
    const token = localStorage.getItem('token'); // or from context/state
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  error => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ===== Response Interceptor =====
api.interceptors.response.use(
  response => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    return response.data; // Return only the data
  },
  error => {
    if (error.response) {
      console.error(`[API Error] ${error.response.status} ${error.response.config.url}`, error.response.data);
      if (error.response.status === 401) {
        console.warn('Unauthorized! Redirecting to login...');
        // Optional: redirect to login if token expired
        window.location.href = '/admin/login';
      }
    } else {
      console.error('[API Network Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
