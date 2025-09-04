import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type User = { user_id: number; name: string; email: string };
type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (u: User, t: string) => Promise<void>;
  clearSession: () => Promise<void>;
  restore: () => Promise<void>;
  refreshToken: string | null;
  setTokens: (access: string, refresh?: string | null) => Promise<void>;
};

const TOKEN_KEY = 'abyss_token';
const USER_KEY = 'abyss_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setSession: async (user, token) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  refreshToken: null,
  setTokens: async (token, refresh = null) => {
    await SecureStore.setItemAsync('abyss_token', token);
    if (refresh != null) {
      await SecureStore.setItemAsync('abyss_refresh', refresh);
      set({ token, refreshToken: refresh, isAuthenticated: true });
    } else {
      set({ token, isAuthenticated: !!token });
    }
  },
  restore: async () => {
    const token = await SecureStore.getItemAsync('abyss_token');
    const refreshToken = await SecureStore.getItemAsync('abyss_refresh');
    const userRaw = await SecureStore.getItemAsync('abyss_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    set({ token, refreshToken, user, isAuthenticated: !!token && !!user });
  },
  clearSession: async () => {
    await SecureStore.deleteItemAsync('abyss_token');
    await SecureStore.deleteItemAsync('abyss_refresh');
    await SecureStore.deleteItemAsync('abyss_user');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },
}));
