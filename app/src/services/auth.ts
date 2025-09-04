import { api } from './api';
import { useAuthStore } from '../store/auth';
import type { User } from '../types/dto';

export async function register(name: string, email: string, password: string) {
  const res = await api.post('/auth/register', { name, email, password });
  if (res.status !== 201) throw res;
  const { user, token, refreshToken } = res.data;
  await useAuthStore.getState().setSession(user, token);
  if (refreshToken) await useAuthStore.getState().setTokens(token, refreshToken);
  return user;
}

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  if (res.status !== 200) throw res;
  const { user, token, refreshToken } = res.data;
  await useAuthStore.getState().setSession(user, token);
  if (refreshToken) await useAuthStore.getState().setTokens(token, refreshToken);
  return user;
}

export async function refreshAccessToken() {
  const rt = useAuthStore.getState().refreshToken;
  if (!rt) throw new Error('No refresh token');
  const resp = await base.post('/auth/refresh', { refreshToken: rt }); // base: instance sans interceptor boucle
  if (resp.status !== 200) throw resp;
  const { token, refreshToken } = resp.data;
  await useAuthStore.getState().setTokens(token, refreshToken ?? null);
  return token as string;
}