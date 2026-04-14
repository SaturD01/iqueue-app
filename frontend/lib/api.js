/**
 * @file api.js
 * @description Axios instance with automatic JWT token attachment
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-14
 */

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('iqueue_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('iqueue_token');
      localStorage.removeItem('iqueue_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;