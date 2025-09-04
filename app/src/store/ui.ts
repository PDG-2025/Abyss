import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

type ThemeMode = 'system' | 'light' | 'dark';

type UIState = {
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
};

const storage = new MMKV();
const KEY = 'ui_theme_mode';

const initialMode = ((): ThemeMode => {
  const v = storage.getString(KEY);
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
})();

export const useUIStore = create<UIState>((set) => ({
  themeMode: initialMode,
  setThemeMode: (m) => {
    storage.set(KEY, m);
    set({ themeMode: m });
  },
}));
