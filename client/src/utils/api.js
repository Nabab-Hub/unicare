import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://unicare-api.onrender.com/api' : '/api',
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
