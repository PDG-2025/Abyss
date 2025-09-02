import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsHome from '../screens/Settings/SettingsTabs';
import ProfileSettingsScreen from '../screens/Settings/tabs/ProfileSettingsScreen';
import AppearanceSettingsScreen from '../screens/Settings/tabs/AppearanceSettingsScreen';
import ApiSettingsScreen from '../screens/Settings/tabs/ApiSettingsScreen';
import SettingsUnits from '../screens/Settings/tabs/SettingsUnits';

export type SettingsStackParamList = {
  SettingsHome: undefined;
  SettingsProfile: undefined;
  SettingsAppearance: undefined;
  SettingsAPI: undefined;
  SettingsUnits: undefined;
  SettingsNotifications: undefined;
  SettingsHelp: undefined;
  SettingsContact: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="SettingsHome" component={SettingsHome} options={{ title: 'Profil' }} />
      <Stack.Screen name="SettingsProfile" component={ProfileSettingsScreen} options={{ title: 'Informations personnelles' }} />
      <Stack.Screen name="SettingsAppearance" component={AppearanceSettingsScreen} options={{ title: 'Apparence' }} />
      <Stack.Screen name="SettingsAPI" component={ApiSettingsScreen} options={{ title: 'API' }} />
      <Stack.Screen name="SettingsUnits" component={SettingsUnits} options={{ title: 'Unités de mesure' }} />
      <Stack.Screen name="SettingsNotifications" component={AppearanceSettingsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="SettingsHelp" component={ApiSettingsScreen} options={{ title: 'Aide' }} />
      <Stack.Screen name="SettingsContact" component={ApiSettingsScreen} options={{ title: 'Contactez-nous' }} />
    </Stack.Navigator>
  );
}
