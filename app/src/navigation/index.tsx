import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import RootStack from './RootStack';
import { DarkAppTheme, LightAppTheme } from '../theme';
import { useUIStore } from '../store/ui';

export default function Navigation() {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const mode = useUIStore((s) => s.themeMode);
  const effectiveScheme = mode === 'system' ? (systemScheme || 'light') : mode;
  const theme = effectiveScheme === 'dark' ? DarkAppTheme : LightAppTheme;

  return (
    <NavigationContainer theme={theme}>
      <RootStack />
    </NavigationContainer>
  );
}
