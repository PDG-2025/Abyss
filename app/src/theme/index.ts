import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';

export const LightAppTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0ea5e9',
    background: '#ffffff',
    text: '#0f172a',
    card: '#f8fafc',
    border: '#e5e7eb',
    notification: '#f59e0b',
  },
};

export const DarkAppTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#38bdf8',
    background: '#0b1220',
    text: '#e5e7eb',
    card: '#0f172a',
    border: '#1f2937',
    notification: '#f59e0b',
  },
};
