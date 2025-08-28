import { api } from './api';
import { useAuthStore } from '../store/auth';
import type { User } from '../types/dto';

export async function register(name: string, email: string, password: string) {
  const res = await api.post('/auth/register', { name, email, password });
  if (res.status !== 201) throw res;
  const { user, token } = res.data as { user: User; token: string };
  await useAuthStore.getState().setSession(user, token);
  return user;
}

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  if (res.status !== 200) throw res;
  const { user, token } = res.data as { user: User; token: string };
  await useAuthStore.getState().setSession(user, token);
  return user;
}
