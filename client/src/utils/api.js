import axios from 'axios';

const isProduction = import.meta.env?.PROD || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');

const API = axios.create({
  baseURL: isProduction ? 'https://unicare-api.onrender.com/api' : '/api',
  withCredentials: true
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('unicare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
