import axios from 'axios';
import { useAuthStore } from '../store/auth';

// Instance de base neutre (pour refresh)
export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000';
export const base = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Instance principale
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Bearer sur chaque requête
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh logique
let isRefreshing = false;
type Pending = { resolve: (value: any) => void; reject: (reason?: any) => void; config: any };
let queue: Pending[] = [];

function drainQueue(error: any, token?: string) {
  queue.forEach(({ resolve, reject, config }) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      resolve(api.request(config));
    } else {
      reject(error);
    }
  });
  queue = [];
}

// Intercepteur de réponse
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config;

    if (!status) {
      // Erreur réseau/timeout
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest?._retry) {
      // Tentative de refresh
      if (isRefreshing) {
        // Mettre en attente jusqu’à refresh
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Si pas d’endpoint refresh dispo, on purge directement
        if (!useAuthStore.getState().refreshToken) {
          await useAuthStore.getState().clearSession();
          return Promise.reject(error);
        }
        // Appel refresh sur l’instance "base" pour éviter boucle d’intercepteurs
        const rt = useAuthStore.getState().refreshToken!;
        const resp = await base.post('/auth/refresh', { refreshToken: rt });
        if (resp.status !== 200) {
          await useAuthStore.getState().clearSession();
          drainQueue(error);
          return Promise.reject(error);
        }
        const { token, refreshToken } = resp.data;
        await useAuthStore.getState().setTokens(token, refreshToken ?? null);
        // Relancer la requête initiale
        originalRequest.headers.Authorization = `Bearer ${token}`;
        drainQueue(null, token);
        return api.request(originalRequest);
      } catch (e) {
        await useAuthStore.getState().clearSession();
        drainQueue(e);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 → purge session (option)
    if (status === 403) {
      await useAuthStore.getState().clearSession();
    }

    return Promise.reject(error);
  }
);
