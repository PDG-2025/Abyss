import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';

export const LightAppTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0ea5e9',
    background: '#ffffff',
    card: '#f7f8fa',            // léger gris
    text: '#0f172a',
    border: '#e2e8f0',          // + doux
    notification: '#f59e0b',
  },
};

export const DarkAppTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#38bdf8',
    background: '#0a1118',      // fond global
    card: '#0f1620',            // cartes
    text: '#eaf2f8',
    border: '#223042',          // séparateurs/bords
    notification: '#f59e0b',
  },
};
