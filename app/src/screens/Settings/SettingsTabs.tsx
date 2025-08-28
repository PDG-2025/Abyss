import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileSettingsScreen from './tabs/ProfileSettingsScreen';
import ApiSettingsScreen from './tabs/ApiSettingsScreen';
import AppearanceSettingsScreen from './tabs/AppearanceSettingsScreen';

const Tab = createBottomTabNavigator();

export default function SettingsTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Profile" component={ProfileSettingsScreen} options={{ title: 'Profil' }} />
      <Tab.Screen name="API" component={ApiSettingsScreen} options={{ title: 'API' }} />
      <Tab.Screen name="Appearance" component={AppearanceSettingsScreen} options={{ title: 'Apparence' }} />
    </Tab.Navigator>
  );
}
