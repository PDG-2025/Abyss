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
  clearSession: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
  restore: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const userRaw = await SecureStore.getItemAsync(USER_KEY);
    const user = userRaw ? (JSON.parse(userRaw) as User) : null;
    set({ token, user, isAuthenticated: !!token && !!user });
  },
}));
