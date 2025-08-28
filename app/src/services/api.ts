import axios from 'axios';
import { useAuthStore } from '../store/auth';

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Injecter token avant chaque requête
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gérer 401/403 globalement
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      await useAuthStore.getState().clearSession();
      // Option: rediriger via un Event/Toast; la RootStack bascule automatiquement sur Login
    }
    return Promise.reject(error);
  }
);
