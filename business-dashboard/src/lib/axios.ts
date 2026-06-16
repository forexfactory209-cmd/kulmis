import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., clear state, redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
