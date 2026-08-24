import axios from 'axios';
import { getToken, clearToken } from '../utils/storage';

const baseURL = process.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

export async function apiRequest(config) {
  const response = await api(config);
  return response.data?.data ?? response.data;
}

export default api;
