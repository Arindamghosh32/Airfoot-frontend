import axios from 'axios';

// Grab the env var — must be set in Vercel dashboard
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// This will show in browser console — lets you verify the URL
console.log('[AirFoot] API Base URL:', BASE_URL);

if (!BASE_URL) {
  console.error('[AirFoot] VITE_API_URL is undefined! Check Vercel env vars.');
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('airfoot_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('airfoot_token');
      localStorage.removeItem('airfoot_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;