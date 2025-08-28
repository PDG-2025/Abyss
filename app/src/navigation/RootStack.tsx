import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import DiveDetailScreen from '../screens/Dives/DiveDetailScreen';
import { useAuthStore } from '../store/auth';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  DiveDetail: { dive_id: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="DiveDetail" component={DiveDetailScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
