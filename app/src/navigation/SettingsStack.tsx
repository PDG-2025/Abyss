import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsTabs from '../screens/Settings/SettingsTabs';

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsTabs" component={SettingsTabs} options={{ title: 'Paramètres' }} />
    </Stack.Navigator>
  );
}
